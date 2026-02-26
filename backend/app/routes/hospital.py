from fastapi import APIRouter, HTTPException
from app.firebase import db
from app.models.schemas import HospitalCreate
import uuid

router = APIRouter(
    prefix="/hospitals",
    tags=["Hospitals"]
)

@router.post("/")
def create_hospital(hospital: HospitalCreate):
    hospital_id = str(uuid.uuid4())
    
    db.collection("hospitals").document(hospital_id).set({
        "hospital_id": hospital_id,
        "hospital_name": hospital.hospital_name,
        "address": hospital.address,
        "city": hospital.city,
        "latitude": hospital.latitude,
        "longitude": hospital.longitude,
        "contact_number": hospital.contact_number,
        "created_by": "admin",
        "status": "active"
    })
    return {"message": "Hospital created successfully", "hospital_id": hospital_id}


@router.get("/")
def get_all_hospitals(search: str = None):
    query = db.collection("hospitals").stream()
    hospitals = []
    for doc in query:
        data = doc.to_dict()
        if search:
            if search.lower() in data.get("hospital_name", "").lower():
                hospitals.append(data)
        else:
            hospitals.append(data)
    return hospitals


@router.get("/{hospital_id}")
def get_hospital(hospital_id: str):
    doc = db.collection("hospitals").document(hospital_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Hospital not found")

    data = doc.to_dict()
    data["hospital_id"] = doc.id
    return data


@router.put("/{hospital_id}")
def update_hospital(
    hospital_id: str,
    name: str | None = None,
    city: str | None = None,
    status: str | None = None
):
    doc_ref = db.collection("hospitals").document(hospital_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Hospital not found")

    update_data = {}
    if name is not None:
        update_data["name"] = name
    if city is not None:
        update_data["city"] = city
    if status is not None:
        update_data["status"] = status

    doc_ref.update(update_data)
    return {"message": "Hospital updated successfully"}


@router.delete("/{hospital_id}")
def delete_hospital(hospital_id: str):
    doc_ref = db.collection("hospitals").document(hospital_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Hospital not found")

    doc_ref.delete()
    return {"message": "Hospital deleted successfully"}
