from fastapi import APIRouter
from app.firebase import db

router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)

@router.post("/patients")
def create_patient(patient_id: str, name: str, age: int, gender: str, phone: str):
    db.collection("patients").document(patient_id).set({
        "name": name,
        "age": age,
        "gender": gender,
        "phone": phone
    })
    return {"message": "Patient created"}

@router.get("/patients")
def get_patients():
    return [{**doc.to_dict(), "patient_id": doc.id} for doc in db.collection("patients").stream()]

@router.get("/patients/{patient_id}")
def get_patient(patient_id: str):
    doc = db.collection("patients").document(patient_id).get()
    if not doc.exists:
        raise HTTPException(404, "Patient not found")
    return {**doc.to_dict(), "patient_id": doc.id}

@router.put("/patients/{patient_id}")
def update_patient(patient_id: str, name: str = None, age: int = None):
    db.collection("patients").document(patient_id).update({k: v for k, v in locals().items() if v})
    return {"message": "Patient updated"}

@router.delete("/patients/{patient_id}")
def delete_patient(patient_id: str):
    db.collection("patients").document(patient_id).delete()
    return {"message": "Patient deleted"}
