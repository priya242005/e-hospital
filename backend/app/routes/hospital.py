from fastapi import APIRouter, HTTPException, Depends
from app.firebase import db
from app.models.schemas import HospitalCreate
import uuid
from datetime import datetime, date
from app.auth_utils import get_current_user, require_role

router = APIRouter(
    prefix="/hospitals",
    tags=["Hospitals"]
)

@router.post("/")
def create_hospital(hospital: HospitalCreate, created_by: str = "admin"):
    hospital_id = str(uuid.uuid4())
    
    hospital_data = {
        "hospital_id": hospital_id,
        "hospital_name": hospital.hospital_name,
        "address": hospital.address,
        "city": hospital.city,
        "latitude": hospital.latitude,
        "longitude": hospital.longitude,
        "contact_number": hospital.contact_number,
        "created_by": created_by,
        "status": "active"
    }
    
    db.collection("hospitals").document(hospital_id).set(hospital_data)
    return {"message": "Hospital created successfully", "hospital_id": hospital_id}


@router.get("/")
def get_all_hospitals(search: str = None):
    query = db.collection("hospitals").stream()
    hospitals = []
    for doc in query:
        data = doc.to_dict()
        if search:
            if search.lower() in data.get("hospital_name", "").lower():
                hospitals.append(data)
        else:
            hospitals.append(data)
    return hospitals


@router.get("/{hospital_id}")
def get_hospital(hospital_id: str):
    doc = db.collection("hospitals").document(hospital_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Hospital not found")

    data = doc.to_dict()
    data["hospital_id"] = doc.id
    return data


@router.put("/{hospital_id}")
def update_hospital(
    hospital_id: str,
    name: str | None = None,
    city: str | None = None,
    status: str | None = None
):
    doc_ref = db.collection("hospitals").document(hospital_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Hospital not found")

    update_data = {}
    if name is not None:
        update_data["name"] = name
    if city is not None:
        update_data["city"] = city
    if status is not None:
        update_data["status"] = status

    doc_ref.update(update_data)
    return {"message": "Hospital updated successfully"}


@router.delete("/{hospital_id}")
def delete_hospital(hospital_id: str):
    doc_ref = db.collection("hospitals").document(hospital_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Hospital not found")

    doc_ref.delete()
    return {"message": "Hospital deleted successfully"}


@router.get("/by-user/{user_id}")
def get_hospital_by_user(user_id: str):
    hospitals = db.collection("hospitals").where("created_by", "==", user_id).limit(1).stream()
    for doc in hospitals:
        data = doc.to_dict()
        data["hospital_id"] = doc.id
        return data
    raise HTTPException(status_code=404, detail="Hospital not found for this user")


@router.get("/{hospital_id}/dashboard")
def get_hospital_dashboard(hospital_id: str, current_user: dict = Depends(require_role(["hospital_admin", "hospital", "super_admin", "admin", "doctor"]))):
    today = date.today().isoformat()
    
    # 1. Doctors Data
    doctors = list(db.collection("doctors").where("hospital_id", "==", hospital_id).stream())
    total_doctors = len(doctors)
    active_doctors = sum(1 for d in doctors if d.to_dict().get("availability") == "available")
    
    # 2. Beds Data
    beds_query = list(db.collection("bed_management").where("hospital_id", "==", hospital_id).stream())
    total_beds = len(beds_query)
    available_beds = sum(1 for b in beds_query if b.to_dict().get("status") == "available")
    
    # 3. OPD Queue Data
    opd_queue = list(db.collection("opd_queue").where("hospital_id", "==", hospital_id).where("opd_date", "==", today).stream())
    today_opd_patients = len(opd_queue)
    waiting_patients = sum(1 for q in opd_queue if q.to_dict().get("status") == "waiting")
    emergency_cases = sum(1 for q in opd_queue if q.to_dict().get("priority") == "emergency")
    
    # 4. Average Waiting Time Calculation
    # Simple estimation for dashboard (waiting_patients * 7 min)
    average_waiting_time = waiting_patients * 7 

    # 5. Doctor Load Monitoring
    doctor_loads = []
    for doc in doctors:
        doc_data = doc.to_dict()
        doc_id = doc.id
        # Calculate waiting patients specifically for this doctor today
        waitlist = sum(1 for q in opd_queue if q.to_dict().get("doctor_id") == doc_id and q.to_dict().get("status") == "waiting")
        completed = sum(1 for q in opd_queue if q.to_dict().get("doctor_id") == doc_id and q.to_dict().get("status") == "completed")
        
        # Load logic: <=5 Normal, 6-10 Moderate, >10 Overloaded
        if waitlist <= 5:
            doc_status = "Normal"
        elif waitlist <= 10:
            doc_status = "Moderate"
        else:
            doc_status = "Overloaded"
            
        doctor_loads.append({
            "doctor_id": doc_id,
            "name": doc_data.get("name"),
            "department_id": doc_data.get("department_id"),
            "current_opd_load": waitlist,
            "patients_completed_today": completed,
            "average_consultation_time": 7,  # Default 7 mins
            "status": doc_status
        })

    return {
        "overview": {
            "hospital_name": db.collection("hospitals").document(hospital_id).get().to_dict().get("hospital_name", "Unknown"),
            "total_doctors": total_doctors,
            "active_doctors": active_doctors,
            "total_beds": total_beds,
            "available_beds": available_beds,
            "today_opd_patients": today_opd_patients,
            "current_waiting_time": average_waiting_time
        },
        "opd_analytics": {
            "emergency_cases": emergency_cases
        },
        "doctor_loads": [{
            "name": d["name"],
            "department": d.get("department_id"),
            "current_load": d["current_opd_load"],
            "max_load": 20,
            "status": d["status"].lower()
        } for d in doctor_loads]
    }
