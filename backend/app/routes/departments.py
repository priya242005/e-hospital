from fastapi import APIRouter, HTTPException
from app.firebase import db
import uuid

router = APIRouter(
    prefix="/departments",
    tags=["Departments"]
)

# -------------------- GET MASTER DEPARTMENTS --------------------
@router.get("/master")
def get_master_departments():
    """Get all master departments"""
    return [{**doc.to_dict(), "department_id": doc.id} for doc in db.collection("master_departments").stream()]

# -------------------- GET DEPARTMENTS FOR HOSPITAL --------------------
@router.get("/")
def get_departments(hospital_id: str):
    """Get departments for a specific hospital"""
    if not hospital_id:
        raise HTTPException(status_code=400, detail="hospital_id is required")
    
    # Get hospital-department mappings
    mappings = db.collection("hospital_departments").where("hospital_id", "==", hospital_id).stream()
    dept_ids = [m.to_dict()["department_id"] for m in mappings]
    
    if not dept_ids:
        return []
    
    # Batch get master department details using getAll
    dept_refs = [db.collection("master_departments").document(dept_id) for dept_id in dept_ids]
    dept_docs = db.get_all(dept_refs)
    
    departments = []
    for dept_doc in dept_docs:
        if dept_doc.exists:
            dept_data = dept_doc.to_dict()
            dept_data["department_id"] = dept_doc.id
            departments.append(dept_data)
    
    return departments

# -------------------- ADD DEPARTMENT TO HOSPITAL --------------------
@router.post("/add-to-hospital")
def add_department_to_hospital(hospital_id: str, department_id: str):
    """Add existing department to hospital"""
    if not hospital_id or not department_id:
        raise HTTPException(status_code=400, detail="hospital_id and department_id are required")
    
    # Check if department exists
    dept_doc = db.collection("master_departments").document(department_id).get()
    if not dept_doc.exists:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Check if already mapped
    existing = list(db.collection("hospital_departments")
        .where("hospital_id", "==", hospital_id)
        .where("department_id", "==", department_id)
        .stream())
    
    if existing:
        return {"message": "Department already added to hospital"}
    
    # Create mapping
    mapping_id = str(uuid.uuid4())
    db.collection("hospital_departments").document(mapping_id).set({
        "mapping_id": mapping_id,
        "hospital_id": hospital_id,
        "department_id": department_id
    })
    
    return {"message": "Department added to hospital", "mapping_id": mapping_id}

# -------------------- SEED DEPARTMENTS --------------------
@router.post("/seed")
def seed_departments(hospital_id: str):
    """Add all master departments to hospital"""
    if not hospital_id:
        raise HTTPException(status_code=400, detail="hospital_id is required")
    
    # Master departments list
    master_departments = [
        {"name": "Cardiology", "desc": "Heart and cardiovascular care"},
        {"name": "Orthopedics", "desc": "Bone and joint treatment"},
        {"name": "Neurology", "desc": "Brain and nervous system"},
        {"name": "Pediatrics", "desc": "Child healthcare"},
        {"name": "General Medicine", "desc": "General health consultation"},
        {"name": "ENT", "desc": "Ear, Nose, and Throat"},
        {"name": "Dermatology", "desc": "Skin and hair care"},
        {"name": "Ophthalmology", "desc": "Eye care and vision"},
        {"name": "Gynecology", "desc": "Women's health"},
        {"name": "Psychiatry", "desc": "Mental health"},
        {"name": "Dentistry", "desc": "Dental and oral care"},
        {"name": "Emergency Medicine", "desc": "Emergency and trauma care"}
    ]
    
    created_mappings = []
    
    for dept in master_departments:
        # Check if master department exists
        existing_dept = list(db.collection("master_departments")
            .where("department_name", "==", dept["name"])
            .stream())
        
        if existing_dept:
            dept_id = existing_dept[0].id
        else:
            # Create master department
            dept_id = str(uuid.uuid4())
            db.collection("master_departments").document(dept_id).set({
                "department_id": dept_id,
                "department_name": dept["name"],
                "description": dept["desc"]
            })
        
        # Check if already mapped to hospital
        existing_mapping = list(db.collection("hospital_departments")
            .where("hospital_id", "==", hospital_id)
            .where("department_id", "==", dept_id)
            .stream())
        
        if not existing_mapping:
            # Create mapping
            mapping_id = str(uuid.uuid4())
            db.collection("hospital_departments").document(mapping_id).set({
                "mapping_id": mapping_id,
                "hospital_id": hospital_id,
                "department_id": dept_id
            })
            created_mappings.append(mapping_id)
    
    return {
        "message": f"{len(created_mappings)} departments added to hospital",
        "mapping_ids": created_mappings,
        "hospital_id": hospital_id
    }
