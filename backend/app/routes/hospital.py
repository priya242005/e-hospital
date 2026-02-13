from fastapi import APIRouter, HTTPException
from app.firebase import db

router = APIRouter(
    prefix="/hospitals",
    tags=["Hospitals"]
)

@router.post("/")
def create_hospital(
    hospital_id: str,
    name: str,
    city: str,
    status: str = "active"
):
    db.collection("hospitals").document(hospital_id).set({
        "name": name,
        "city": city,
        "status": status
    })
    return {"message": "Hospital created successfully"}


@router.get("/")
def get_all_hospitals():
    hospitals = []
    for doc in db.collection("hospitals").stream():
        data = doc.to_dict()
        data["hospital_id"] = doc.id
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
