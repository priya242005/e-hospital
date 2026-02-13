from fastapi import APIRouter
from app.firebase import db

router = APIRouter(
    prefix="/medicines",
    tags=["Medicines"]
)

@router.post("/medicines")
def add_medicine(medicine_id: str, hospital_id: str, stock: int, threshold: int):
    db.collection("medicines").document(medicine_id).set({
        "hospital_id": hospital_id,
        "stock": stock,
        "threshold": threshold
    })
    return {"message": "Medicine added"}

@router.get("/medicines")
def get_medicines():
    return [{**doc.to_dict(), "medicine_id": doc.id} for doc in db.collection("medicines").stream()]
