from fastapi import APIRouter
from app.firebase import db
import uuid

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
)

@router.post("/")
def create_appointment(
    patient_id: str,
    hospital_id: str,
    department: str,
    date: str,
    time_slot: str,
    doctor_id: str
):
    appointment_id = str(uuid.uuid4())
    
    db.collection("appointments").document(appointment_id).set({
        "appointment_id": appointment_id,
        "patient_id": patient_id,
        "hospital_id": hospital_id,
        "department": department,
        "date": date,
        "time_slot": time_slot,
        "doctor_id": doctor_id,
        "status": "scheduled"
    })
    return {"message": "Appointment created", "appointment_id": appointment_id}

@router.get("/")
def get_appointments():
    return [{**doc.to_dict(), "appointment_id": doc.id} for doc in db.collection("appointments").stream()]

@router.put("/{appointment_id}")
def update_appointment(appointment_id: str, status: str):
    db.collection("appointments").document(appointment_id).update({"status": status})
    return {"message": "Appointment updated"}

@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: str):
    db.collection("appointments").document(appointment_id).delete()
    return {"message": "Appointment deleted"}
