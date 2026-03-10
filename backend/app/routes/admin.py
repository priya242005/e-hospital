from fastapi import APIRouter, Depends, HTTPException
from app.firebase import db
from datetime import date
from typing import List
from app.auth_utils import get_current_user, require_role

router = APIRouter(
    prefix="/admin",
    tags=["Admin Dashboard"]
)

# ==================== CITY-LEVEL HOSPITAL MONITORING ====================
@router.get("/city-status")
def get_city_status(city: str, current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    hospitals = list(db.collection("hospitals").where("city", "==", city).stream())
    
    result = []
    
    for hospital in hospitals:
        hospital_data = hospital.to_dict()
        hospital_id = hospital.id
        
        # Beds Activity
        beds_query = list(db.collection("bed_management").where("hospital_id", "==", hospital_id).stream())
        total_beds = len(beds_query)
        available_beds = sum(1 for b in beds_query if b.to_dict().get("status") == "available")
        
        # OPD Patients for today
        today = date.today().isoformat()
        opd_queue = list(db.collection("opd_queue").where("hospital_id", "==", hospital_id).where("opd_date", "==", today).stream())
        opd_patients = len(opd_queue)
        
        result.append({
            "hospital_name": hospital_data.get("hospital_name"),
            "city": hospital_data.get("city"),
            "total_beds": total_beds,
            "available_beds": available_beds,
            "opd_patients": opd_patients,
            "status": hospital_data.get("status", "active")
        })
        
    return result

# ==================== SYSTEM ANALYTICS ====================
@router.get("/analytics")
def get_system_analytics(current_user: dict = Depends(require_role(["super_admin", "admin"]))):
    # Total Hospitals
    hospitals = list(db.collection("hospitals").stream())
    total_hospitals = len(hospitals)
    
    # Total Doctors
    doctors = list(db.collection("doctors").stream())
    total_doctors = len(doctors)
    
    # Total Patients (from users with role 'patient' or from family_members/patients depending on your schema approach)
    # Using 'users' for now where role is patient
    users = list(db.collection("users").where("role", "==", "patient").stream())
    total_patients = len(users)
    
    today = date.today().isoformat()
    
    # Appointments Today
    appointments = list(db.collection("appointments").where("appointment_date", "==", today).stream())
    appointments_today = len(appointments)
    
    # OPD Tokens Generated Today
    opd_queue = list(db.collection("opd_queue").where("opd_date", "==", today).stream())
    tokens_generated_today = len(opd_queue)
    
    return {
        "total_hospitals": total_hospitals,
        "total_doctors": total_doctors,
        "total_patients": total_patients,
        "appointments_today": appointments_today,
        "tokens_generated_today": tokens_generated_today
    }
