from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.firebase import db
from datetime import datetime
from app.auth_utils import create_access_token, get_password_hash, verify_password
import bcrypt

router = APIRouter(prefix="/auth", tags=["Authentication"])

class UserRegister(BaseModel):
    name: str
    email: str
    phone: str = None
    password: str
    role: str = "patient"
    hospital_id: str = None
    license_number: str = None
    pharmacy_name: str = None
    address: str = None

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(user: UserRegister):
    users_ref = db.collection("users")
    existing = users_ref.where("email", "==", user.email).limit(1).stream()
    
    if list(existing):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    
    user_data = {
        "name": user.name,
        "email": user.email,
        "phone": user.phone if user.phone else "",
        "role": user.role,
        "password": hashed_password.decode('utf-8'),
        "hospital_id": user.hospital_id if user.hospital_id else None,
        "license_number": user.license_number if user.license_number else None,
        "pharmacy_name": user.pharmacy_name if user.pharmacy_name else None,
        "address": user.address if user.address else None,
        "created_at": datetime.utcnow().isoformat()
    }
    
    doc_ref = users_ref.add(user_data)
    user_id = doc_ref[1].id
    
    return {"message": "User registered successfully", "user_id": user_id}

@router.get("/users")
def get_all_users():
    users_ref = db.collection("users")
    users = []
    for doc in users_ref.stream():
        user_data = doc.to_dict()
        user_data['user_id'] = doc.id
        user_data.pop('password', None)  # Remove password from response
        users.append(user_data)
    return users

@router.post("/login")
def login(user: UserLogin):
    users_ref = db.collection("users")
    user_docs = users_ref.where("email", "==", user.email).limit(1).stream()
    
    user_doc = None
    for doc in user_docs:
        user_doc = doc
        break
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_data = user_doc.to_dict()
    
    if not bcrypt.checkpw(user.password.encode('utf-8'), user_data["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Get hospital_id if hospital_admin
    hospital_id = None
    if user_data.get("role") == "hospital_admin":
        hospitals = db.collection("hospitals").where("created_by", "==", user_doc.id).limit(1).stream()
        for h in hospitals:
            hospital_id = h.id
            break

    # Get hospital_id if pharmacy_admin (stored directly on user record when created by hospital admin)
    if user_data.get("role") == "pharmacy_admin":
        hospital_id = user_data.get("hospital_id") or None

    # Get doctor_id if doctor
    doctor_id = None
    if user_data.get("role") == "doctor":
        doctors = db.collection("doctors").where("user_id", "==", user_doc.id).limit(1).stream()
        for d in doctors:
            doctor_id = d.id
            hospital_id = d.to_dict().get("hospital_id")
            break

    # Create JWT token with all required fields
    access_token = create_access_token({
        "sub": user.email,
        "user_id": user_doc.id,
        "email": user.email,
        "role": user_data.get("role", "patient"),
        "hospital_id": hospital_id,
        "doctor_id": doctor_id
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user_data.get("role", "patient"),
        "user_id": user_doc.id,
        "hospital_id": hospital_id,
        "doctor_id": doctor_id,
        "user": {
            "user_id": user_doc.id,
            "name": user_data["name"],
            "email": user_data["email"],
            "role": user_data.get("role", "patient"),
            "hospital_id": hospital_id,
            "doctor_id": doctor_id
        }
    }
