from fastapi import APIRouter
from app.firebase import db

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
)

@router.post("/appointments")
def create_appointment(appointment_id: str, patient_id: str, hospital_id: str,
                       department: str, date: str, time_slot: str, doctor_id: str):
    db.collection("appointments").document(appointment_id).set({
        "patient_id": patient_id,
        "hospital_id": hospital_id,
        "department": department,
        "date": date,
        "time_slot": time_slot,
        "doctor_id": doctor_id,
        "status": "scheduled"
    })
    return {"message": "Appointment created"}

@router.get("/appointments")
def get_appointments():
    return [{**doc.to_dict(), "appointment_id": doc.id} for doc in db.collection("appointments").stream()]

@router.put("/appointments/{appointment_id}")
def update_appointment(appointment_id: str, status: str):
    db.collection("appointments").document(appointment_id).update({"status": status})
    return {"message": "Appointment updated"}

@router.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: str):
    db.collection("appointments").document(appointment_id).delete()
    return {"message": "Appointment deleted"}
