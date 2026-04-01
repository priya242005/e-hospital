"""
Add this to backend/app/routes/auth.py to create hospital admin credentials via API
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.firebase import db
from datetime import datetime
import bcrypt

# Add this class to auth.py
class CreateHospitalAdminRequest(BaseModel):
    hospital_id: str
    email: str
    password: str
    name: str = None

# Add this endpoint to auth.py router
@router.post("/create-hospital-admin")
def create_hospital_admin(request: CreateHospitalAdminRequest):
    """
    Create hospital admin credentials
    
    Example:
    POST /auth/create-hospital-admin
    {
        "hospital_id": "hospital-uuid",
        "email": "admin@hospital.com",
        "password": "SecurePassword123",
        "name": "Hospital Admin"
    }
    """
    
    # Check if hospital exists
    hospital_doc = db.collection("hospitals").document(request.hospital_id).get()
    if not hospital_doc.exists:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    hospital_name = hospital_doc.to_dict().get("hospital_name", "Hospital")
    
    # Check if email already exists
    existing_user = db.collection("users").where("email", "==", request.email).limit(1).stream()
    if list(existing_user):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create user
    user_data = {
        "name": request.name or f"{hospital_name} Admin",
        "email": request.email,
        "phone": "",
        "role": "hospital_admin",
        "password": hashed_password,
        "hospital_id": request.hospital_id,
        "created_at": datetime.utcnow().isoformat()
    }
    
    doc_ref = db.collection("users").add(user_data)
    user_id = doc_ref[1].id
    
    return {
        "message": "Hospital admin created successfully",
        "user_id": user_id,
        "email": request.email,
        "hospital_id": request.hospital_id,
        "hospital_name": hospital_name
    }

@router.get("/hospital-admins/{hospital_id}")
def get_hospital_admins(hospital_id: str):
    """Get all admins for a hospital"""
    admins = db.collection("users")\
        .where("hospital_id", "==", hospital_id)\
        .where("role", "==", "hospital_admin")\
        .stream()
    
    result = []
    for doc in admins:
        data = doc.to_dict()
        data.pop("password", None)  # Remove password
        data["user_id"] = doc.id
        result.append(data)
    
    return result
