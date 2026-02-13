from fastapi import APIRouter
from app.firebase import db

router = APIRouter(
    prefix="/opd",
    tags=["OPD"]
)

@router.post("/opd")
def add_to_opd(patient_id: str, appointment_id: str):
    token = int(time.time())
    db.collection("opd_queue").document(str(token)).set({
        "patient_id": patient_id,
        "appointment_id": appointment_id,
        "status": "waiting"
    })
    return {"token": token}

@router.get("/opd")
def view_opd_queue():
    return [{**doc.to_dict(), "token": doc.id} for doc in db.collection("opd_queue").stream()]

@router.put("/opd/{token}")
def complete_opd(token: str):
    db.collection("opd_queue").document(token).update({"status": "completed"})
    return {"message": "Consultation completed"}
