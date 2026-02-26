from fastapi import APIRouter, HTTPException
from app.firebase import db
from app.models.schemas import DoctorCreate
from datetime import datetime, date
import uuid

router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"]
)

# -------------------- CREATE DOCTOR --------------------
@router.post("/")
def create_doctor(doctor: DoctorCreate):
    doctor_id = str(uuid.uuid4())
    
    db.collection("doctors").document(doctor_id).set({
        "doctor_id": doctor_id,
        "name": doctor.name,
        "hospital_id": doctor.hospital_id,
        "department_id": doctor.department_id,
        "specialization": doctor.specialization,
        "availability": "available",
        "max_daily_opd": doctor.max_daily_opd,
        "created_at": datetime.now().isoformat()
    })
    return {"message": "Doctor created successfully", "doctor_id": doctor_id}

# -------------------- GET ALL DOCTORS --------------------
@router.get("/")
def get_all_doctors(hospital_id: str = None):
    query = db.collection("doctors")
    if hospital_id:
        query = query.where("hospital_id", "==", hospital_id)
    return [{**doc.to_dict(), "doctor_id": doc.id} for doc in query.stream()]

# -------------------- GET DOCTORS BY HOSPITAL AND DEPARTMENT --------------------
@router.get("/by-hospital-department")
def get_doctors_by_hospital_department(hospital_id: str, department_id: str):
    print(f"Fetching doctors for hospital_id: {hospital_id}, department_id: {department_id}")
    
    all_hospital_doctors = list(db.collection("doctors").where("hospital_id", "==", hospital_id).stream())
    print(f"Total doctors in hospital: {len(all_hospital_doctors)}")
    for doc in all_hospital_doctors:
        data = doc.to_dict()
        print(f"Doctor: {data.get('name')}, dept_id: {data.get('department_id')}, avail: {data.get('availability')}")
    
    query = db.collection("doctors")\
        .where("hospital_id", "==", hospital_id)\
        .where("department_id", "==", department_id)\
        .where("availability", "==", "available")
    
    doctors = [{**doc.to_dict(), "doctor_id": doc.id} for doc in query.stream()]
    print(f"Filtered doctors: {len(doctors)}")
    return doctors

# -------------------- LOAD BALANCING LOGIC --------------------
@router.get("/assign/doctor")
def assign_doctor(hospital_id: str, department_id: str):
    today = date.today().isoformat()

    doctors = list(
        db.collection("doctors")
        .where("hospital_id", "==", hospital_id)
        .where("department_id", "==", department_id)
        .where("availability", "==", "available")
        .stream()
    )

    if not doctors:
        raise HTTPException(status_code=404, detail="No available doctors")

    min_load = float("inf")
    selected_doctor = None

    for doc in doctors:
        load = len(list(
            db.collection("opd_queue")
            .where("doctor_id", "==", doc.id)
            .where("status", "==", "waiting")
            .where("opd_date", "==", today)
            .stream()
        ))

        if load < min_load:
            min_load = load
            selected_doctor = doc

    return {
        "doctor_id": selected_doctor.id,
        "current_load": min_load
    }

# -------------------- GET ONE DOCTOR --------------------
@router.get("/{doctor_id}")
def get_doctor(doctor_id: str):
    doc = db.collection("doctors").document(doctor_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {**doc.to_dict(), "doctor_id": doc.id}

# -------------------- UPDATE DOCTOR --------------------
@router.put("/{doctor_id}")
def update_doctor(
    doctor_id: str,
    name: str | None = None,
    department_id: str | None = None,
    specialization: str | None = None,
    availability: str | None = None
):
    ref = db.collection("doctors").document(doctor_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Doctor not found")

    data = {}
    if name: data["name"] = name
    if department_id: data["department_id"] = department_id
    if specialization: data["specialization"] = specialization
    if availability: data["availability"] = availability

    ref.update(data)
    return {"message": "Doctor updated successfully"}

# -------------------- DELETE DOCTOR --------------------
@router.delete("/{doctor_id}")
def delete_doctor(doctor_id: str):
    ref = db.collection("doctors").document(doctor_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Doctor not found")
    ref.delete()
    return {"message": "Doctor deleted successfully"}

# -------------------- SEED DOCTORS --------------------
@router.post("/seed")
def seed_doctors(hospital_id: str):
    """Create dummy doctors - requires departments to exist first"""
    if not hospital_id:
        raise HTTPException(status_code=400, detail="hospital_id is required")
    
    mappings = db.collection("hospital_departments").where("hospital_id", "==", hospital_id).stream()
    dept_ids = [m.to_dict()["department_id"] for m in mappings]
    
    if not dept_ids:
        raise HTTPException(status_code=400, detail="No departments found. Create departments first.")
    
    dept_refs = [db.collection("master_departments").document(dept_id) for dept_id in dept_ids]
    dept_docs = db.get_all(dept_refs)
    
    dept_map = {}
    for dept_doc in dept_docs:
        if dept_doc.exists:
            dept_map[dept_doc.to_dict()["department_name"]] = dept_doc.id
    
    doctors_data = [
        {"name": "Dr. Rajesh Kumar", "dept": "Cardiology", "spec": "Cardiologist"},
        {"name": "Dr. Priya Sharma", "dept": "Cardiology", "spec": "Cardiac Surgeon"},
        {"name": "Dr. Amit Patel", "dept": "Orthopedics", "spec": "Orthopedic Surgeon"},
        {"name": "Dr. Sneha Reddy", "dept": "Orthopedics", "spec": "Sports Medicine"},
        {"name": "Dr. Vikram Singh", "dept": "Neurology", "spec": "Neurologist"},
        {"name": "Dr. Anjali Mehta", "dept": "Neurology", "spec": "Neurosurgeon"},
        {"name": "Dr. Suresh Iyer", "dept": "Pediatrics", "spec": "Pediatrician"},
        {"name": "Dr. Kavita Desai", "dept": "Pediatrics", "spec": "Child Specialist"},
        {"name": "Dr. Ramesh Gupta", "dept": "General Medicine", "spec": "General Physician"},
        {"name": "Dr. Meera Nair", "dept": "General Medicine", "spec": "Internal Medicine"},
        {"name": "Dr. Arun Verma", "dept": "ENT", "spec": "ENT Specialist"},
        {"name": "Dr. Pooja Joshi", "dept": "ENT", "spec": "Audiologist"},
        {"name": "Dr. Kiran Shah", "dept": "Dermatology", "spec": "Dermatologist"},
        {"name": "Dr. Neha Kapoor", "dept": "Dermatology", "spec": "Cosmetologist"},
        {"name": "Dr. Sanjay Rao", "dept": "Ophthalmology", "spec": "Eye Surgeon"},
        {"name": "Dr. Divya Menon", "dept": "Ophthalmology", "spec": "Optometrist"},
        {"name": "Dr. Lakshmi Iyer", "dept": "Gynecology", "spec": "Gynecologist"},
        {"name": "Dr. Radha Krishnan", "dept": "Gynecology", "spec": "Obstetrician"},
        {"name": "Dr. Arjun Malhotra", "dept": "Psychiatry", "spec": "Psychiatrist"},
        {"name": "Dr. Simran Kaur", "dept": "Psychiatry", "spec": "Clinical Psychologist"},
        {"name": "Dr. Ravi Shankar", "dept": "Dentistry", "spec": "Dentist"},
        {"name": "Dr. Anita Deshmukh", "dept": "Dentistry", "spec": "Orthodontist"},
        {"name": "Dr. Manoj Kumar", "dept": "Emergency Medicine", "spec": "Emergency Physician"},
        {"name": "Dr. Swati Pillai", "dept": "Emergency Medicine", "spec": "Trauma Specialist"}
    ]
    
    created_ids = []
    for doctor in doctors_data:
        if doctor["dept"] not in dept_map:
            continue
        doctor_id = str(uuid.uuid4())
        db.collection("doctors").document(doctor_id).set({
            "doctor_id": doctor_id,
            "name": doctor["name"],
            "hospital_id": hospital_id,
            "department_id": dept_map[doctor["dept"]],
            "specialization": doctor["spec"],
            "availability": "available",
            "max_daily_opd": None,
            "created_at": datetime.now().isoformat()
        })
        created_ids.append(doctor_id)
    
    return {"message": f"{len(created_ids)} doctors created successfully", "doctor_ids": created_ids, "hospital_id": hospital_id}
