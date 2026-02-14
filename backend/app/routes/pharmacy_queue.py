from fastapi import APIRouter, HTTPException
from app.firebase import db
from datetime import date, timedelta

router = APIRouter(
    prefix="/pharmacy",
    tags=["Pharmacy"]
)

# -------------------- ADD / UPDATE MEDICINE --------------------
@router.post("/medicines")
def add_medicine(
    medicine_id: str,
    name: str,
    current_stock: int,
    reorder_level: int
):
    db.collection("medicines").document(medicine_id).set({
        "medicine_id": medicine_id,
        "name": name,
        "current_stock": current_stock,
        "reorder_level": reorder_level
    })
    return {"message": "Medicine added/updated successfully"}

# -------------------- ISSUE MEDICINE --------------------
@router.post("/issue")
def issue_medicine(medicine_id: str, quantity: int):
    med_ref = db.collection("medicines").document(medicine_id)
    med_doc = med_ref.get()

    if not med_doc.exists:
        raise HTTPException(status_code=404, detail="Medicine not found")

    med = med_doc.to_dict()
    if quantity > med["current_stock"]:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    med_ref.update({
        "current_stock": med["current_stock"] - quantity
    })

    db.collection("medicine_issues").add({
        "medicine_id": medicine_id,
        "quantity": quantity,
        "issue_date": date.today().isoformat()
    })

    return {"message": "Medicine issued successfully"}

# -------------------- DEMAND PREDICTION & ALERT --------------------
@router.get("/predict/{medicine_id}")
def predict_demand(medicine_id: str):
    med_doc = db.collection("medicines").document(medicine_id).get()
    if not med_doc.exists:
        raise HTTPException(status_code=404, detail="Medicine not found")

    med = med_doc.to_dict()
    today = date.today()
    last_week = today - timedelta(days=7)

    issues = list(
        db.collection("medicine_issues")
        .where("medicine_id", "==", medicine_id)
        .stream()
    )

    total_issued = 0
    for issue in issues:
        issue_date = date.fromisoformat(issue.to_dict()["issue_date"])
        if issue_date >= last_week:
            total_issued += issue.to_dict()["quantity"]

    avg_daily_demand = total_issued / 7 if total_issued > 0 else 0
    reorder_days = 5
    predicted_need = avg_daily_demand * reorder_days

    alert_generated = False

    if med["current_stock"] < predicted_need:
        db.collection("alerts").add({
            "type": "LOW_STOCK",
            "medicine_id": medicine_id,
            "message": f"{med['name']} likely to run out soon"
        })
        alert_generated = True

    return {
        "medicine": med["name"],
        "current_stock": med["current_stock"],
        "avg_daily_demand": round(avg_daily_demand, 2),
        "predicted_need_next_5_days": round(predicted_need, 2),
        "alert_generated": alert_generated
    }
