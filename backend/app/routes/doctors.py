from fastapi import APIRouter, HTTPException
from app.firebase import db
from datetime import date
import uuid

router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"]
)

# -------------------- CREATE DOCTOR --------------------
@router.post("/")
def create_doctor(
    name: str,
    department: str,
    hospital_id: str,
    availability: str = "available"
):
    doctor_id = str(uuid.uuid4())
    
    db.collection("doctors").document(doctor_id).set({
        "doctor_id": doctor_id,
        "name": name,
        "department": department,
        "hospital_id": hospital_id,
        "availability": availability
    })
    return {"message": "Doctor created successfully", "doctor_id": doctor_id}

# -------------------- GET ALL DOCTORS --------------------
@router.get("/")
def get_all_doctors():
    return [{**doc.to_dict(), "doctor_id": doc.id}
            for doc in db.collection("doctors").stream()]

# -------------------- GET ONE DOCTOR --------------------
@router.get("/{doctor_id}")
def get_doctor(doctor_id: str):
    doc = db.collection("doctors").document(doctor_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {**doc.to_dict(), "doctor_id": doc.id}

# -------------------- UPDATE DOCTOR --------------------
@router.put("/{doctor_id}")
def update_doctor(
    doctor_id: str,
    name: str | None = None,
    department: str | None = None,
    availability: str | None = None
):
    ref = db.collection("doctors").document(doctor_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Doctor not found")

    data = {}
    if name: data["name"] = name
    if department: data["department"] = department
    if availability: data["availability"] = availability

    ref.update(data)
    return {"message": "Doctor updated successfully"}

# -------------------- DELETE DOCTOR --------------------
@router.delete("/{doctor_id}")
def delete_doctor(doctor_id: str):
    ref = db.collection("doctors").document(doctor_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Doctor not found")
    ref.delete()
    return {"message": "Doctor deleted successfully"}

# -------------------- GET DOCTORS BY HOSPITAL AND DEPARTMENT --------------------
@router.get("/by-hospital-department")
def get_doctors_by_hospital_department(hospital_id: str, department: str):
    doctors = db.collection("doctors")\
        .where("hospital_id", "==", hospital_id)\
        .where("department", "==", department)\
        .where("availability", "==", "available")\
        .stream()
    
    result = []
    for doc in doctors:
        data = doc.to_dict()
        data["doctor_id"] = doc.id
        result.append(data)
    
    return result

# -------------------- LOAD BALANCING LOGIC --------------------
@router.get("/assign/doctor")
def assign_doctor(hospital_id: str, department: str):
    today = date.today().isoformat()

    doctors = list(
        db.collection("doctors")
        .where("hospital_id", "==", hospital_id)
        .where("department", "==", department)
        .where("availability", "==", "available")
        .stream()
    )

    if not doctors:
        raise HTTPException(status_code=404, detail="No available doctors")

    min_load = float("inf")
    selected_doctor = None

    for doc in doctors:
        load = len(list(
            db.collection("opd_queue")
            .where("doctor_id", "==", doc.id)
            .where("status", "==", "waiting")
            .where("opd_date", "==", today)
            .stream()
        ))

        if load < min_load:
            min_load = load
            selected_doctor = doc

    return {
        "doctor_id": selected_doctor.id,
        "current_load": min_load
    }
