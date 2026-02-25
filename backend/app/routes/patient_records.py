from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import uuid
from app.firebase import db

router = APIRouter(prefix="/patients", tags=["Patients"])

class PatientCreate(BaseModel):
    user_id: str
    name: str
    age: int
    gender: str
    phone: str

@router.post("")
async def create_patient(patient: PatientCreate):
    patient_id = str(uuid.uuid4())
    
    patient_data = {
        "patient_id": patient_id,
        "user_id": patient.user_id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "phone": patient.phone,
        "created_at": datetime.utcnow()
    }
    
    db.collection("patients").document(patient_id).set(patient_data)
    
    return {"message": "Patient added successfully", "patient_id": patient_id}

@router.get("/{user_id}")
async def get_user_patients(user_id: str):
    patients_ref = db.collection("patients")
    patients = patients_ref.where("user_id", "==", user_id).get()
    
    result = []
    for patient in patients:
        data = patient.to_dict()
        result.append(data)
    
    return result
