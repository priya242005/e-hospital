from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.firebase import db
from datetime import datetime, timedelta
import jwt
import bcrypt

router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

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
        "password": hashed_password.decode('utf-8'),
        "created_at": datetime.utcnow().isoformat()
    }
    
    doc_ref = users_ref.add(user_data)
    user_id = doc_ref[1].id
    
    return {"message": "User registered successfully", "user_id": user_id}

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
    
    access_token = create_access_token({"sub": user.email, "user_id": user_doc.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user_doc.id,
            "name": user_data["name"],
            "email": user_data["email"]
        }
    }
