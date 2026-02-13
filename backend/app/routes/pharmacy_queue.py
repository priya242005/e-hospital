from fastapi import APIRouter
from app.firebase import db

router = APIRouter(
    prefix="/pharmacy_queue",
    tags=["Pharmacy Queue"]
)
@router.post("/pharmacy_queue")
def add_to_pharmacy_queue(
    patient_id: str,
    prescription_id: str,
    hospital_id: str
):
    token = int(time.time())  # simple token generation

    db.collection("pharmacy_queue").document(str(token)).set({
        "patient_id": patient_id,
        "prescription_id": prescription_id,
        "hospital_id": hospital_id,
        "status": "waiting"
    })

    return {
        "message": "Added to pharmacy queue",
        "pharmacy_token": token
    }

# -------------------- READ ALL PHARMACY QUEUE --------------------
@router.get("/pharmacy_queue")
def get_pharmacy_queue():
    queue = []
    for doc in db.collection("pharmacy_queue").stream():
        data = doc.to_dict()
        data["pharmacy_token"] = doc.id
        queue.append(data)
    return queue

# -------------------- READ ONE TOKEN --------------------
@router.get("/pharmacy_queue/{token}")
def get_pharmacy_token(token: str):
    doc = db.collection("pharmacy_queue").document(token).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Token not found")

    data = doc.to_dict()
    data["pharmacy_token"] = token
    return data

# -------------------- UPDATE PHARMACY STATUS --------------------
@router.put("/pharmacy_queue/{token}")
def update_pharmacy_status(
    token: str,
    status: str  # waiting / issued / partial
):
    if status not in ["waiting", "issued", "partial"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    doc_ref = db.collection("pharmacy_queue").document(token)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Token not found")

    doc_ref.update({
        "status": status
    })

    return {"message": "Pharmacy queue updated"}

# -------------------- DELETE PHARMACY TOKEN --------------------
@router.delete("/pharmacy_queue/{token}")
def delete_pharmacy_token(token: str):
    doc_ref = db.collection("pharmacy_queue").document(token)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Token not found")

    doc_ref.delete()
    return {"message": "Pharmacy token deleted"}
