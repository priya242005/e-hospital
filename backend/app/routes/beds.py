from fastapi import APIRouter, HTTPException, Depends
from app.firebase import db
from datetime import datetime
import uuid
from typing import List

from app.models.schemas import BedManagement, BedManagementCreate
from app.auth_utils import get_current_user, require_role

router = APIRouter(
    prefix="/beds",
    tags=["Bed Management"]
)

# -------------------- CREATE BED (Admin/Hospital) --------------------
@router.post("/", response_model=BedManagement)
def create_bed(
    bed_data: BedManagementCreate,
    current_user: dict = Depends(require_role(["hospital_admin", "admin"]))
):
    bed_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    new_bed = {
        **bed_data.dict(),
        "bed_id": bed_id,
        "updated_at": now
    }
    
    db.collection("bed_management").document(bed_id).set(new_bed)
    return new_bed

# -------------------- GET ALL BEDS BY HOSPITAL --------------------
@router.get("/", response_model=List[BedManagement])
def get_beds(hospital_id: str, current_user: dict = Depends(get_current_user)):
    # Both patients and hospital staff might need to see available beds
    beds_query = db.collection("bed_management").where("hospital_id", "==", hospital_id).stream()
    
    beds = []
    for doc in beds_query:
        beds.append(doc.to_dict())
        
    return beds

# -------------------- UPDATE BED STATUS (Hospital Staff) --------------------
@router.put("/{bed_id}")
def update_bed_status(
    bed_id: str,
    status: str = None,
    patient_id: str = None
):
    bed_ref = db.collection("bed_management").document(bed_id)
    bed_doc = bed_ref.get()
    
    if not bed_doc.exists:
        raise HTTPException(status_code=404, detail="Bed not found")
    
    updates = {"updated_at": datetime.utcnow().isoformat()}
    if status:
        if status not in ["available", "occupied", "reserved"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        updates["status"] = status
    if patient_id:
        updates["patient_id"] = patient_id
    
    bed_ref.update(updates)
    return {"message": "Bed updated", "bed_id": bed_id}
