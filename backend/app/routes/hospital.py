from fastapi import APIRouter, HTTPException
from app.firebase import db
from app.models.schemas import HospitalCreate
import uuid
from datetime import datetime, date

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
def get_hospital_dashboard(hospital_id: str):
    today = date.today().isoformat()
    
    # Get doctors
    doctors = list(db.collection("doctors").where("hospital_id", "==", hospital_id).stream())
    total_doctors = len(doctors)
    active_doctors = sum(1 for d in doctors if d.to_dict().get("availability") == "available")
    
    # Get beds
    beds_doc = db.collection("beds").document(hospital_id).get()
    beds_data = beds_doc.to_dict() if beds_doc.exists else {"total_beds": 0, "available_beds": 0}
    
    # Get OPD queue for today
    opd_queue = list(db.collection("opd_queue").where("hospital_id", "==", hospital_id).where("opd_date", "==", today).stream())
    waiting_patients = sum(1 for q in opd_queue if q.to_dict().get("status") == "waiting")
    completed_today = sum(1 for q in opd_queue if q.to_dict().get("status") == "completed")
    emergency_cases = sum(1 for q in opd_queue if q.to_dict().get("priority") == "emergency")
    elder_cases = sum(1 for q in opd_queue if q.to_dict().get("priority") == "elder")
    
    # Calculate average waiting time (7 min per patient)
    avg_waiting_time = waiting_patients * 7
    
    # Get doctor loads
    doctor_loads = []
    for doc in doctors:
        doc_data = doc.to_dict()
        doc_id = doc.id
        current_load = sum(1 for q in opd_queue if q.to_dict().get("doctor_id") == doc_id and q.to_dict().get("status") == "waiting")
        max_opd = doc_data.get("max_daily_opd", 50)
        load_percent = (current_load / max_opd * 100) if max_opd > 0 else 0
        
        status = "green" if load_percent < 60 else "yellow" if load_percent < 85 else "red"
        
        doctor_loads.append({
            "doctor_id": doc_id,
            "name": doc_data.get("name"),
            "department_id": doc_data.get("department_id"),
            "current_load": current_load,
            "max_load": max_opd,
            "load_percent": round(load_percent, 1),
            "status": status
        })
    
    # Get pharmacy alerts (low stock medicines)
    medicines = list(db.collection("medicines").stream())
    low_stock = sum(1 for m in medicines if m.to_dict().get("stock_quantity", 0) < m.to_dict().get("threshold_limit", 0))
    
    return {
        "overview": {
            "total_doctors": total_doctors,
            "active_doctors": active_doctors,
            "total_beds": beds_data.get("total_beds", 0),
            "available_beds": beds_data.get("available_beds", 0),
            "today_opd_patients": len(opd_queue),
            "current_waiting_time": avg_waiting_time
        },
        "opd_analytics": {
            "waiting_patients": waiting_patients,
            "completed_today": completed_today,
            "emergency_cases": emergency_cases,
            "elder_cases": elder_cases,
            "avg_waiting_time": avg_waiting_time
        },
        "doctor_loads": doctor_loads,
        "bed_status": {
            "total_beds": beds_data.get("total_beds", 0),
            "available_beds": beds_data.get("available_beds", 0),
            "occupancy_percent": round((beds_data.get("total_beds", 0) - beds_data.get("available_beds", 0)) / beds_data.get("total_beds", 1) * 100, 1) if beds_data.get("total_beds", 0) > 0 else 0,
            "status": beds_data.get("status", "green")
        },
        "pharmacy_alerts": {
            "low_stock": low_stock,
            "expiring_soon": 0,
            "high_demand": 0
        }
    }
