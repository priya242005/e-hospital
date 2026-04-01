from fastapi import APIRouter, HTTPException, Depends
from app.firebase import db
from datetime import datetime, date, timedelta
import uuid
from typing import List, Optional
from pydantic import BaseModel

from app.models.schemas import PharmacyInventory, PharmacyInventoryCreate, PharmacyQueue, PharmacyQueueCreate
from app.auth_utils import get_current_user, require_role

router = APIRouter(
    prefix="/pharmacy",
    tags=["Pharmacy Management"]
)

class MedicineAdd(BaseModel):
    medicine_name: str
    stock_quantity: int
    minimum_threshold: int
    expiry_date: str  # YYYY-MM-DD
    price_per_unit: float = 0.0

class BillRequest(BaseModel):
    quantity: int

def _create_alert(hospital_id: str, medicine_name: str, stock: int, threshold: int):
    """Create a low-stock notification in Firestore."""
    # Avoid duplicate alerts: check if one already exists for this medicine
    existing = list(db.collection("notifications")
        .where("hospital_id", "==", hospital_id)
        .where("medicine_name", "==", medicine_name)
        .where("type", "==", "pharmacy_alert")
        .stream())
    if existing:
        # Update existing
        existing[0].reference.update({
            "message": f"LOW STOCK: {medicine_name} — {stock} units left (threshold: {threshold})",
            "created_at": datetime.utcnow().isoformat()
        })
    else:
        nid = str(uuid.uuid4())
        db.collection("notifications").document(nid).set({
            "notification_id": nid,
            "hospital_id": hospital_id,
            "type": "pharmacy_alert",
            "medicine_name": medicine_name,
            "message": f"LOW STOCK: {medicine_name} — {stock} units left (threshold: {threshold})",
            "priority": "high" if stock == 0 else "medium",
            "created_at": datetime.utcnow().isoformat()
        })

def _resolve_alert(hospital_id: str, medicine_name: str):
    """Remove low-stock alert when stock is replenished above threshold."""
    existing = list(db.collection("notifications")
        .where("hospital_id", "==", hospital_id)
        .where("medicine_name", "==", medicine_name)
        .where("type", "==", "pharmacy_alert")
        .stream())
    for doc in existing:
        doc.reference.delete()

# ==================== PHARMACY INVENTORY ====================

@router.post("/inventory")
def add_inventory(
    hospital_id: str,
    item: MedicineAdd,
    current_user: dict = Depends(require_role(["pharmacy_admin", "admin", "hospital_admin"]))
):
    medicine_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    data = {
        "medicine_id": medicine_id,
        "hospital_id": hospital_id,
        "medicine_name": item.medicine_name,
        "stock_quantity": item.stock_quantity,
        "minimum_threshold": item.minimum_threshold,
        "expiry_date": item.expiry_date,
        "price_per_unit": item.price_per_unit,
        "last_updated": now
    }
    db.collection("pharmacy_inventory").document(medicine_id).set(data)
    if item.stock_quantity < item.minimum_threshold:
        _create_alert(hospital_id, item.medicine_name, item.stock_quantity, item.minimum_threshold)
    return data

@router.get("/inventory/{hospital_id}")
def get_inventory(hospital_id: str, current_user: dict = Depends(get_current_user)):
    items = [doc.to_dict() for doc in
             db.collection("pharmacy_inventory").where("hospital_id", "==", hospital_id).stream()]
    # Sort by earliest expiry date first
    items.sort(key=lambda x: x.get("expiry_date", "9999-99-99"))
    return items

@router.delete("/inventory/{medicine_id}")
def delete_medicine(
    medicine_id: str,
    current_user: dict = Depends(require_role(["pharmacy_admin", "admin", "hospital_admin"]))
):
    ref = db.collection("pharmacy_inventory").document(medicine_id)
    doc = ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Medicine not found")
    data = doc.to_dict()
    _resolve_alert(data["hospital_id"], data["medicine_name"])
    ref.delete()
    return {"message": "Medicine deleted"}

@router.post("/inventory/{medicine_id}/bill")
def bill_medicine(
    medicine_id: str,
    body: BillRequest,
    current_user: dict = Depends(require_role(["pharmacy_admin", "admin", "hospital_admin"]))
):
    ref = db.collection("pharmacy_inventory").document(medicine_id)
    doc = ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Medicine not found")
    data = doc.to_dict()
    current_stock = data["stock_quantity"]
    if body.quantity > current_stock:
        raise HTTPException(status_code=400, detail=f"Insufficient stock. Available: {current_stock}")
    new_stock = current_stock - body.quantity
    ref.update({"stock_quantity": new_stock, "last_updated": datetime.utcnow().isoformat()})
    total = round(body.quantity * data.get("price_per_unit", 0), 2)
    # Alert if now below threshold
    if new_stock < data["minimum_threshold"]:
        _create_alert(data["hospital_id"], data["medicine_name"], new_stock, data["minimum_threshold"])
    elif new_stock >= data["minimum_threshold"]:
        _resolve_alert(data["hospital_id"], data["medicine_name"])
    return {
        "medicine_name": data["medicine_name"],
        "billed_quantity": body.quantity,
        "remaining_stock": new_stock,
        "price_per_unit": data.get("price_per_unit", 0),
        "total_amount": total
    }

@router.put("/inventory/{medicine_id}")
def update_inventory(
    medicine_id: str,
    stock_quantity: int,
    current_user: dict = Depends(require_role(["pharmacy_admin", "admin", "hospital_admin"]))
):
    ref = db.collection("pharmacy_inventory").document(medicine_id)
    doc = ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Medicine not found")
    data = doc.to_dict()
    ref.update({"stock_quantity": stock_quantity, "last_updated": datetime.utcnow().isoformat()})
    if stock_quantity < data["minimum_threshold"]:
        _create_alert(data["hospital_id"], data["medicine_name"], stock_quantity, data["minimum_threshold"])
    else:
        _resolve_alert(data["hospital_id"], data["medicine_name"])
    return ref.get().to_dict()

# ==================== ALERTS ====================

@router.get("/my-hospital")
def get_my_hospital(current_user: dict = Depends(get_current_user)):
    """Returns the hospital_id from the current user's token. Used by pharmacy dashboard to resolve hospital."""
    hospital_id = current_user.get("hospital_id")
    if not hospital_id:
        raise HTTPException(status_code=404, detail="No hospital linked to this account")
    return {"hospital_id": hospital_id}

@router.get("/alerts/{hospital_id}")
def get_pharmacy_alerts(hospital_id: str):
    """Returns active low-stock and expiry alerts. No auth — used by both pharmacy and hospital dashboards."""
    today = date.today()
    soon = (today + timedelta(days=30)).isoformat()
    today_str = today.isoformat()

    items = [doc.to_dict() for doc in
             db.collection("pharmacy_inventory").where("hospital_id", "==", hospital_id).stream()]

    alerts = []
    for item in items:
        stock = item.get("stock_quantity", 0)
        threshold = item.get("minimum_threshold", 0)
        expiry = item.get("expiry_date", "")
        name = item.get("medicine_name", "")

        if stock == 0:
            alerts.append({"type": "out_of_stock", "priority": "critical", "medicine_name": name,
                           "message": f"{name} is OUT OF STOCK", "stock": stock, "threshold": threshold})
        elif stock < threshold:
            alerts.append({"type": "low_stock", "priority": "high", "medicine_name": name,
                           "message": f"{name} — only {stock} units left (min: {threshold})",
                           "stock": stock, "threshold": threshold})
        if expiry and expiry <= today_str:
            alerts.append({"type": "expired", "priority": "critical", "medicine_name": name,
                           "message": f"{name} EXPIRED on {expiry}", "expiry_date": expiry})
        elif expiry and expiry <= soon:
            alerts.append({"type": "expiring_soon", "priority": "medium", "medicine_name": name,
                           "message": f"{name} expires on {expiry} (within 30 days)", "expiry_date": expiry})

    alerts.sort(key=lambda x: {"critical": 0, "high": 1, "medium": 2}.get(x["priority"], 3))
    return alerts

# ==================== SEED ====================

@router.post("/seed/{hospital_id}")
def seed_pharmacy(hospital_id: str):
    """Seed pharmacy inventory with realistic data. Some items intentionally below threshold for alert testing."""
    today = date.today()
    medicines = [
        # Normal stock (17 medicines)
        {"name": "Paracetamol 500mg",      "stock": 500, "threshold": 50,  "expiry": (today + timedelta(days=365)).isoformat(),  "price": 2.5},
        {"name": "Amoxicillin 250mg",      "stock": 300, "threshold": 40,  "expiry": (today + timedelta(days=300)).isoformat(),  "price": 8.0},
        {"name": "Ibuprofen 400mg",        "stock": 400, "threshold": 50,  "expiry": (today + timedelta(days=400)).isoformat(),  "price": 5.0},
        {"name": "Metformin 500mg",        "stock": 250, "threshold": 30,  "expiry": (today + timedelta(days=500)).isoformat(),  "price": 4.0},
        {"name": "Atorvastatin 10mg",      "stock": 200, "threshold": 25,  "expiry": (today + timedelta(days=450)).isoformat(),  "price": 12.0},
        {"name": "Omeprazole 20mg",        "stock": 180, "threshold": 30,  "expiry": (today + timedelta(days=350)).isoformat(),  "price": 6.5},
        {"name": "Cetirizine 10mg",        "stock": 350, "threshold": 40,  "expiry": (today + timedelta(days=600)).isoformat(),  "price": 3.0},
        {"name": "Pantoprazole 40mg",      "stock": 220, "threshold": 30,  "expiry": (today + timedelta(days=420)).isoformat(),  "price": 7.0},
        {"name": "Amlodipine 5mg",         "stock": 160, "threshold": 20,  "expiry": (today + timedelta(days=480)).isoformat(),  "price": 9.0},
        {"name": "Losartan 50mg",          "stock": 140, "threshold": 20,  "expiry": (today + timedelta(days=390)).isoformat(),  "price": 11.0},
        {"name": "Doxycycline 100mg",      "stock": 130, "threshold": 25,  "expiry": (today + timedelta(days=320)).isoformat(),  "price": 10.0},
        {"name": "Ciprofloxacin 500mg",    "stock": 170, "threshold": 30,  "expiry": (today + timedelta(days=340)).isoformat(),  "price": 15.0},
        {"name": "Ranitidine 150mg",       "stock": 190, "threshold": 25,  "expiry": (today + timedelta(days=410)).isoformat(),  "price": 4.5},
        {"name": "Diclofenac 50mg",        "stock": 210, "threshold": 30,  "expiry": (today + timedelta(days=370)).isoformat(),  "price": 6.0},
        {"name": "Montelukast 10mg",       "stock": 120, "threshold": 20,  "expiry": (today + timedelta(days=460)).isoformat(),  "price": 18.0},
        {"name": "Levothyroxine 50mcg",    "stock": 100, "threshold": 15,  "expiry": (today + timedelta(days=550)).isoformat(),  "price": 14.0},
        {"name": "Vitamin D3 60000IU",     "stock": 280, "threshold": 35,  "expiry": (today + timedelta(days=730)).isoformat(),  "price": 22.0},
        {"name": "Multivitamin Tablet",    "stock": 320, "threshold": 40,  "expiry": (today + timedelta(days=540)).isoformat(),  "price": 5.5},
        # Below threshold — triggers alerts (2 medicines)
        {"name": "Azithromycin 500mg",     "stock": 12,  "threshold": 50,  "expiry": (today + timedelta(days=200)).isoformat(),  "price": 25.0},
        {"name": "Insulin Glargine 100U",  "stock": 6,   "threshold": 20,  "expiry": (today + timedelta(days=120)).isoformat(),  "price": 150.0},
    ]
    created = []
    for m in medicines:
        mid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        data = {
            "medicine_id": mid, "hospital_id": hospital_id,
            "medicine_name": m["name"], "stock_quantity": m["stock"],
            "minimum_threshold": m["threshold"], "expiry_date": m["expiry"],
            "price_per_unit": m["price"], "last_updated": now
        }
        db.collection("pharmacy_inventory").document(mid).set(data)
        if m["stock"] < m["threshold"]:
            _create_alert(hospital_id, m["name"], m["stock"], m["threshold"])
        created.append(m["name"])
    return {"message": f"{len(created)} medicines seeded", "medicines": created}

# ==================== PHARMACY QUEUE ====================

@router.post("/queue", response_model=PharmacyQueue)
def add_to_queue(
    queue_data: PharmacyQueueCreate,
    current_user: dict = Depends(require_role(["hospital_admin", "admin"]))
):
    prescription_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    new_queue = {
        **queue_data.dict(),
        "prescription_id": prescription_id,
        "created_at": now
    }
    db.collection("pharmacy_queue").document(prescription_id).set(new_queue)
    return new_queue

@router.get("/queue/{hospital_id}", response_model=List[PharmacyQueue])
def get_queue(hospital_id: str, current_user: dict = Depends(get_current_user)):
    queue_list = [doc.to_dict() for doc in
                  db.collection("pharmacy_queue")
                  .where("hospital_id", "==", hospital_id)
                  .where("status", "in", ["preparing", "ready"])
                  .stream()]
    return queue_list

@router.put("/queue/{prescription_id}/status", response_model=PharmacyQueue)
def update_queue_status(
    prescription_id: str,
    status: str,
    current_user: dict = Depends(require_role(["pharmacy_admin", "hospital_admin", "admin"]))
):
    if status not in ["preparing", "ready", "collected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    q_ref = db.collection("pharmacy_queue").document(prescription_id)
    if not q_ref.get().exists:
        raise HTTPException(status_code=404, detail="Prescription not found")
    q_ref.update({"status": status})
    return q_ref.get().to_dict()

# ==================== DEMAND ANALYTICS ====================

@router.get("/analytics/{hospital_id}")
def get_demand_analytics(hospital_id: str, current_user: dict = Depends(require_role(["pharmacy_admin", "admin", "hospital_admin"]))):
    return {
        "daily_usage": {"Paracetamol": 50, "Amoxicillin": 20},
        "weekly_demand": {"Paracetamol": 350, "Amoxicillin": 140},
        "most_used_medicines": ["Paracetamol", "Amoxicillin", "Ibuprofen"]
    }
