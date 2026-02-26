from fastapi import APIRouter, HTTPException
from app.firebase import db
from app.models.schemas import PatientCreate, FamilyMemberCreate
from datetime import datetime
import uuid

router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)

@router.post("/")
def create_patient(patient: PatientCreate):
    patient_id = str(uuid.uuid4())
    db.collection("patients").document(patient_id).set({
        "patient_id": patient_id,
        "user_id": patient.user_id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "phone": patient.phone,
        "created_at": datetime.now().isoformat()
    })
    return {"message": "Patient created", "patient_id": patient_id}

@router.get("/{patient_id}")
def get_patient(patient_id: str):
    doc = db.collection("patients").document(patient_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Patient not found")
    return doc.to_dict()

@router.get("/by-user/{user_id}")
def get_patients_by_user(user_id: str):
    """Get all family members for a user"""
    patients = db.collection("family_members").where("user_id", "==", user_id).stream()
    return [{**doc.to_dict(), "patient_id": doc.id} for doc in patients]

# ==================== FAMILY MEMBERS ====================
@router.post("/family-members")
def add_family_member(member: FamilyMemberCreate):
    member_id = str(uuid.uuid4())
    db.collection("family_members").document(member_id).set({
        "family_member_id": member_id,
        "user_id": member.patient_id,
        "name": member.name,
        "age": member.age,
        "gender": member.gender,
        "blood_group": member.blood_group,
        "relation": member.relation
    })
    return {"message": "Family member added", "family_member_id": member_id}

@router.get("/family-members/{user_id}")
def get_family_members(user_id: str):
    members = db.collection("family_members").where("user_id", "==", user_id).stream()
    return [{**doc.to_dict(), "family_member_id": doc.id} for doc in members]
