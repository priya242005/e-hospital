from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
import bcrypt
import uuid
from app.firebase import db

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
async def register(request: RegisterRequest):
    # Check if email already exists
    users_ref = db.collection("users")
    existing_user = users_ref.where("email", "==", request.email).limit(1).get()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password with lower cost factor for faster processing
    password_hash = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt(rounds=4)).decode('utf-8')
    
    # Generate unique user ID
    user_id = str(uuid.uuid4())
    
    # Create user document
    user_data = {
        "user_id": user_id,
        "name": request.name,
        "email": request.email,
        "password_hash": password_hash,
        "role": "patient",
        "hospital_id": None,
        "created_at": datetime.utcnow()
    }
    
    db.collection("users").document(user_id).set(user_data)
    
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(request: LoginRequest):
    # Fetch user by email
    users_ref = db.collection("users")
    user_docs = users_ref.where("email", "==", request.email).limit(1).get()
    
    if not user_docs:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_doc = user_docs[0]
    user_data = user_doc.to_dict()
    
    # Verify password
    if not bcrypt.checkpw(request.password.encode('utf-8'), user_data["password_hash"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "message": "Login successful",
        "user": {
            "user_id": user_data["user_id"],
            "name": user_data["name"],
            "email": user_data["email"],
            "role": user_data["role"]
        }
    }
