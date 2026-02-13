from fastapi import APIRouter
from app.firebase import db

router = APIRouter(
    prefix="/beds",
    tags=["Beds"]
)

@router.post("/beds")
def update_beds(hospital_id: str, total: int, available: int):
    status = "green" if available > total*0.5 else "yellow" if available > 0 else "red"
    db.collection("beds").document(hospital_id).set({
        "total": total,
        "available": available,
        "status": status
    })
    return {"bed_status": status}

@router.get("/beds")
def get_beds():
    return [{**doc.to_dict(), "hospital_id": doc.id} for doc in db.collection("beds").stream()]
