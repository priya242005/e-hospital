from fastapi import APIRouter
from app.firebase import db

router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"]
)
@router.post("/doctors")
def create_doctor(
    doctor_id: str,
    name: str,
    department: str,
    hospital_id: str,
    availability: str = "available"
):
    db.collection("doctors").document(doctor_id).set({
        "name": name,
        "department": department,
        "hospital_id": hospital_id,
        "availability": availability
    })
    return {"message": "Doctor created successfully"}

# -------------------- READ ALL DOCTORS --------------------
@router.get("/doctors")
def get_all_doctors():
    doctors = []
    for doc in db.collection("doctors").stream():
        data = doc.to_dict()
        data["doctor_id"] = doc.id
        doctors.append(data)
    return doctors

# -------------------- READ ONE DOCTOR --------------------
@router.get("/doctors/{doctor_id}")
def get_doctor(doctor_id: str):
    doc = db.collection("doctors").document(doctor_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Doctor not found")

    data = doc.to_dict()
    data["doctor_id"] = doc.id
    return data

# -------------------- UPDATE DOCTOR --------------------
@router.put("/doctors/{doctor_id}")
def update_doctor(
    doctor_id: str,
    name: str | None = None,
    department: str | None = None,
    availability: str | None = None
):
    doc_ref = db.collection("doctors").document(doctor_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Doctor not found")

    update_data = {}
    if name is not None:
        update_data["name"] = name
    if department is not None:
        update_data["department"] = department
    if availability is not None:
        update_data["availability"] = availability

    doc_ref.update(update_data)
    return {"message": "Doctor updated successfully"}

# -------------------- DELETE DOCTOR --------------------
@router.delete("/doctors/{doctor_id}")
def delete_doctor(doctor_id: str):
    doc_ref = db.collection("doctors").document(doctor_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Doctor not found")

    doc_ref.delete()
    return {"message": "Doctor deleted successfully"}
