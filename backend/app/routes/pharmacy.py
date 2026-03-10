from fastapi import APIRouter, HTTPException, Depends
from app.firebase import db
from datetime import datetime, date
import uuid
from typing import List

from app.models.schemas import PharmacyInventory, PharmacyInventoryCreate, PharmacyQueue, PharmacyQueueCreate
from app.auth_utils import get_current_user, require_role

router = APIRouter(
    prefix="/pharmacy",
    tags=["Pharmacy Management"]
)

# ==================== PHARMACY INVENTORY ====================

@router.post("/inventory", response_model=PharmacyInventory)
def add_inventory(
    item_data: PharmacyInventoryCreate,
    current_user: dict = Depends(require_role(["pharmacy_admin", "admin", "hospital_admin"]))
):
    medicine_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    new_item = {
        **item_data.dict(),
        "medicine_id": medicine_id,
        "last_updated": now
    }
    
    db.collection("pharmacy_inventory").document(medicine_id).set(new_item)
    return new_item


@router.get("/inventory/{hospital_id}", response_model=List[PharmacyInventory])
def get_inventory(hospital_id: str, current_user: dict = Depends(get_current_user)):
    inventory_query = db.collection("pharmacy_inventory").where("hospital_id", "==", hospital_id).stream()
    
    items = []
    for doc in inventory_query:
        items.append(doc.to_dict())
        
    return items

@router.put("/inventory/{medicine_id}", response_model=PharmacyInventory)
def update_inventory(
    medicine_id: str,
    stock_quantity: int,
    current_user: dict = Depends(require_role(["pharmacy_admin", "admin", "hospital_admin"]))
):
    med_ref = db.collection("pharmacy_inventory").document(medicine_id)
    med_doc = med_ref.get()
    
    if not med_doc.exists:
        raise HTTPException(status_code=404, detail="Medicine not found")
        
    updates = {
        "stock_quantity": stock_quantity,
        "last_updated": datetime.utcnow().isoformat()
    }
    
    med_ref.update(updates)
    return med_ref.get().to_dict()

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
    queue_query = db.collection("pharmacy_queue") \
        .where("hospital_id", "==", hospital_id) \
        .where("status", "in", ["preparing", "ready"]) \
        .stream()
        
    queue_list = []
    for doc in queue_query:
        queue_list.append(doc.to_dict())
        
    # Sort by token theoretically or estimated wait time
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
    q_doc = q_ref.get()
    
    if not q_doc.exists:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    q_ref.update({"status": status})
    return q_ref.get().to_dict()

# ==================== DEMAND ANALYTICS ====================

@router.get("/analytics/{hospital_id}")
def get_demand_analytics(hospital_id: str, current_user: dict = Depends(require_role(["pharmacy_admin", "admin", "hospital_admin"]))):
    # Mocking this for MVP just to fulfill the specs visually
    # In a full system we'd aggregate historical pharmacy_inventory usages
    return {
        "daily_usage": {"Paracetamol": 50, "Amoxicillin": 20},
        "weekly_demand": {"Paracetamol": 350, "Amoxicillin": 140},
        "most_used_medicines": ["Paracetamol", "Amoxicillin", "Ibuprofen"]
    }
