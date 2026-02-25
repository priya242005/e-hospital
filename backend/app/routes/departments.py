from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import uuid
from app.firebase import db

router = APIRouter(prefix="/departments", tags=["Departments"])

class DepartmentCreate(BaseModel):
    hospital_id: str
    name: str
    description: str

@router.post("")
async def create_department(dept: DepartmentCreate):
    department_id = str(uuid.uuid4())
    
    dept_data = {
        "department_id": department_id,
        "hospital_id": dept.hospital_id,
        "name": dept.name,
        "description": dept.description,
        "status": "active"
    }
    
    db.collection("departments").document(department_id).set(dept_data)
    
    return {"message": "Department created successfully", "department_id": department_id}

@router.get("")
async def get_departments(hospital_id: str = None):
    departments_ref = db.collection("departments")
    
    if hospital_id:
        departments = departments_ref.where("hospital_id", "==", hospital_id).where("status", "==", "active").get()
    else:
        departments = departments_ref.where("status", "==", "active").get()
    
    result = []
    for dept in departments:
        data = dept.to_dict()
        result.append(data)
    
    return result
