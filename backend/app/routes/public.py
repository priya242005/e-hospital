from fastapi import APIRouter
from app.firebase import db
from datetime import date
from google.cloud.firestore_v1.base_query import FieldFilter

router = APIRouter(
    prefix="/public",
    tags=["Public Healthcare Dashboard"]
)

@router.get("/healthcare-overview")
def get_healthcare_overview():
    """Healthcare System Overview - No authentication required"""
    today = date.today().isoformat()
    
    # Count hospitals
    hospitals = list(db.collection("hospitals").stream())
    total_hospitals = len(hospitals)
    
    # Count doctors
    doctors = list(db.collection("doctors").stream())
    total_doctors = len(doctors)
    
    # Count available beds
    total_beds = 0
    available_beds = 0
    for hospital in hospitals:
        h_data = hospital.to_dict()
        beds_doc = db.collection("bed_management").where("hospital_id", "==", hospital.id).stream()
        for bed in beds_doc:
            total_beds += 1
            if bed.to_dict().get("status") == "available":
                available_beds += 1
    
    # Count today's OPD patients
    opd_today = list(db.collection("opd_queue").where("opd_date", "==", today).stream())
    opd_patients_today = len(opd_today)
    
    # Count emergency cases
    emergency_cases = sum(1 for q in opd_today if q.to_dict().get("priority") == "emergency")
    
    return {
        "total_hospitals": total_hospitals,
        "total_doctors": total_doctors,
        "total_beds": total_beds,
        "available_beds": available_beds,
        "opd_patients_today": opd_patients_today,
        "emergency_cases": emergency_cases
    }

@router.get("/hospital-status")
def get_hospital_status():
    """Hospital Status Panel with color indicators"""
    today = date.today().isoformat()
    hospitals = db.collection("hospitals").stream()
    
    result = []
    for hospital in hospitals:
        h_data = hospital.to_dict()
        hospital_id = hospital.id
        
        # Count beds
        beds = list(db.collection("bed_management").where("hospital_id", "==", hospital_id).stream())
        total_beds = len(beds)
        available_beds_count = sum(1 for b in beds if b.to_dict().get("status") == "available")
        
        # Count OPD load
        opd_load = len(list(db.collection("opd_queue")
                           .where(filter=FieldFilter("hospital_id", "==", hospital_id))
                           .where(filter=FieldFilter("opd_date", "==", today))
                           .where(filter=FieldFilter("status", "==", "waiting"))
                           .stream()))
        
        # Determine status color
        occupancy_percent = ((total_beds - available_beds_count) / total_beds * 100) if total_beds > 0 else 0
        if occupancy_percent < 60:
            status = "green"
        elif occupancy_percent < 85:
            status = "yellow"
        else:
            status = "red"
        
        result.append({
            "hospital_id": hospital_id,
            "hospital_name": h_data.get("hospital_name"),
            "city": h_data.get("city"),
            "total_beds": total_beds,
            "available_beds": available_beds_count,
            "opd_load": opd_load,
            "status": status
        })
    
    return result

@router.get("/bed-availability")
def get_bed_availability():
    """Real-Time Bed Availability by type"""
    hospitals = db.collection("hospitals").stream()
    
    result = []
    for hospital in hospitals:
        h_data = hospital.to_dict()
        hospital_id = hospital.id
        
        beds = list(db.collection("bed_management").where("hospital_id", "==", hospital_id).stream())
        
        general_available = sum(1 for b in beds if b.to_dict().get("bed_type") == "general" and b.to_dict().get("status") == "available")
        icu_available = sum(1 for b in beds if b.to_dict().get("bed_type") == "icu" and b.to_dict().get("status") == "available")
        emergency_available = sum(1 for b in beds if b.to_dict().get("bed_type") == "emergency" and b.to_dict().get("status") == "available")
        
        result.append({
            "hospital_name": h_data.get("hospital_name"),
            "general_beds": general_available,
            "icu_beds": icu_available,
            "emergency_beds": emergency_available
        })
    
    return result

@router.get("/opd-waiting-times")
def get_opd_waiting_times():
    """OPD Waiting Time Monitor"""
    today = date.today().isoformat()
    
    # Get all hospitals
    hospitals = db.collection("hospitals").stream()
    
    result = []
    for hospital in hospitals:
        h_data = hospital.to_dict()
        hospital_id = hospital.id
        
        # Get departments in this hospital
        dept_mappings = db.collection("hospital_departments").where("hospital_id", "==", hospital_id).stream()
        
        for mapping in dept_mappings:
            dept_id = mapping.to_dict().get("department_id")
            dept_doc = db.collection("master_departments").document(dept_id).get()
            if not dept_doc.exists:
                continue
            
            dept_name = dept_doc.to_dict().get("department_name")
            
            # Count waiting patients
            waiting = len(list(db.collection("opd_queue")
                              .where("hospital_id", "==", hospital_id)
                              .where("department_id", "==", dept_id)
                              .where("opd_date", "==", today)
                              .where("status", "==", "waiting")
                              .stream()))
            
            if waiting > 0:
                estimated_time = waiting * 7  # 7 minutes per patient
                result.append({
                    "hospital": h_data.get("hospital_name"),
                    "department": dept_name,
                    "patients_waiting": waiting,
                    "estimated_wait_time": estimated_time
                })
    
    return result

@router.get("/pharmacy-alerts")
def get_pharmacy_alerts():
    """Pharmacy Alert Panel"""
    inventory = db.collection("pharmacy_inventory").stream()
    
    low_stock = []
    out_of_stock = []
    high_demand = []
    
    for item in inventory:
        data = item.to_dict()
        medicine_name = data.get("medicine_name")
        stock = data.get("stock_quantity", 0)
        threshold = data.get("minimum_threshold", 0)
        
        if stock == 0:
            out_of_stock.append(medicine_name)
        elif stock < threshold:
            low_stock.append(medicine_name)
        elif stock > threshold * 5:  # Mock high demand logic
            high_demand.append(medicine_name)
    
    return {
        "low_stock": low_stock,
        "out_of_stock": out_of_stock,
        "high_demand": high_demand
    }

@router.get("/nearby-hospitals")
def get_nearby_hospitals(latitude: float = 28.6139, longitude: float = 77.2090):
    """Nearby Hospital Finder - Mock distance calculation"""
    hospitals = db.collection("hospitals").stream()
    
    result = []
    for hospital in hospitals:
        h_data = hospital.to_dict()
        hospital_id = hospital.id
        
        # Mock distance calculation (in real app, use haversine formula)
        distance = abs(h_data.get("latitude", 0) - latitude) + abs(h_data.get("longitude", 0) - longitude)
        distance_km = round(distance * 111, 1)  # Rough conversion
        
        # Count available beds
        beds = list(db.collection("bed_management").where("hospital_id", "==", hospital_id).stream())
        available_beds = sum(1 for b in beds if b.to_dict().get("status") == "available")
        
        result.append({
            "hospital_name": h_data.get("hospital_name"),
            "distance_km": distance_km,
            "available_beds": available_beds,
            "emergency_contact": h_data.get("contact_number"),
            "address": h_data.get("address")
        })
    
    # Sort by distance
    result.sort(key=lambda x: x["distance_km"])
    return result[:10]  # Return top 10 nearest
