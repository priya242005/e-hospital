from fastapi import APIRouter, HTTPException, Depends
from app.firebase import db
from datetime import datetime
import uuid
from app.auth_utils import get_current_user, require_role

router = APIRouter(
    prefix="/pharmacy-staff",
    tags=["Pharmacy Staff"]
)

# -------------------- GET PHARMACY CREDENTIALS BY HOSPITAL --------------------
@router.get("/credentials/{hospital_id}")
def get_pharmacy_credentials(hospital_id: str):
    """Get all pharmacy users (credentials) for a hospital"""
    staff_docs = db.collection("users")\
        .where("role", "==", "pharmacy")\
        .where("hospital_id", "==", hospital_id)\
        .stream()
    
    staff = []
    for doc in staff_docs:
        staff_data = doc.to_dict()
        staff_data['user_id'] = doc.id
        staff_data.pop('password', None)
        staff.append(staff_data)
    
    return staff

# -------------------- GET PHARMACY STAFF BY HOSPITAL --------------------
@router.get("/{hospital_id}")
def get_pharmacy_staff(hospital_id: str, current_user: dict = Depends(get_current_user)):
    staff_docs = db.collection("users")\
        .where("role", "==", "pharmacy_staff")\
        .where("hospital_id", "==", hospital_id)\
        .stream()
    
    staff = []
    for doc in staff_docs:
        staff_data = doc.to_dict()
        staff_data['user_id'] = doc.id
        staff_data.pop('password', None)
        staff.append(staff_data)
    
    return staff

# -------------------- DEACTIVATE PHARMACY STAFF --------------------
@router.put("/{staff_id}/deactivate")
def deactivate_staff(staff_id: str, current_user: dict = Depends(require_role(["hospital_admin", "admin"]))):
    staff_ref = db.collection("users").document(staff_id)
    
    if not staff_ref.get().exists:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    staff_ref.update({"is_active": False})
    return {"message": "Staff deactivated successfully"}

# -------------------- ACTIVATE PHARMACY STAFF --------------------
@router.put("/{staff_id}/activate")
def activate_staff(staff_id: str, current_user: dict = Depends(require_role(["hospital_admin", "admin"]))):
    staff_ref = db.collection("users").document(staff_id)
    
    if not staff_ref.get().exists:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    staff_ref.update({"is_active": True})
    return {"message": "Staff activated successfully"}
