from fastapi import APIRouter
from app.firebase import db
import uuid

router = APIRouter(
    prefix="/medicines",
    tags=["Medicines"]
)

@router.post("/")
def add_medicine(
    name: str,
    hospital_id: str,
    stock: int,
    threshold: int
):
    medicine_id = str(uuid.uuid4())
    
    db.collection("medicines").document(medicine_id).set({
        "medicine_id": medicine_id,
        "name": name,
        "hospital_id": hospital_id,
        "stock": stock,
        "threshold": threshold
    })
    return {"message": "Medicine added", "medicine_id": medicine_id}

@router.get("/")
def get_medicines():
    return [{**doc.to_dict(), "medicine_id": doc.id} for doc in db.collection("medicines").stream()]
