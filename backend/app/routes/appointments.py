from fastapi import APIRouter, HTTPException
from app.firebase import db
from app.models.schemas import AppointmentCreate, OPDQueueCreate
from datetime import datetime, date
from pydantic import BaseModel
import random

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
)

class WalkInAppointment(BaseModel):
    hospital_id: str
    patient_name: str
    age: int
    gender: str
    contact_number: str
    department_id: str
    doctor_id: str = None
    priority: str = "normal"
    appointment_date: str

def generate_token_number():
    """Generate easy to remember 6-digit token number"""
    today = date.today()
    # Get count of tokens today
    tokens_today = list(db.collection("opd_queue")
        .where("opd_date", "==", today.isoformat())
        .stream())
    
    # Format: DDMMNN (DD=day, MM=month, NN=sequence number)
    sequence = len(tokens_today) + 1
    token = f"{today.day:02d}{today.month:02d}{sequence:02d}"
    return token

@router.post("/walk-in")
def create_walk_in_appointment(appointment: WalkInAppointment):
    """Create walk-in appointment without patient_id"""
    from uuid import uuid4
    appointment_id = str(uuid4())
    patient_id = str(uuid4())
    
    # Create temporary patient record
    db.collection("walk_in_patients").document(patient_id).set({
        "patient_id": patient_id,
        "name": appointment.patient_name,
        "age": appointment.age,
        "gender": appointment.gender,
        "contact_number": appointment.contact_number,
        "created_at": datetime.now().isoformat()
    })
    
    # Auto-assign doctor if not provided
    doctor_id = appointment.doctor_id
    if not doctor_id:
        doctors = list(db.collection("doctors")
            .where("hospital_id", "==", appointment.hospital_id)
            .where("department_id", "==", appointment.department_id)
            .where("availability", "==", "available")
            .stream())
        
        if not doctors:
            raise HTTPException(status_code=404, detail="No available doctors")
        
        # Load balancing
        today = date.today().isoformat()
        min_load = float("inf")
        selected_doctor = None
        
        for doc in doctors:
            load = len(list(db.collection("opd_queue")
                .where("doctor_id", "==", doc.id)
                .where("status", "==", "waiting")
                .where("opd_date", "==", today)
                .stream()))
            if load < min_load:
                min_load = load
                selected_doctor = doc
        
        doctor_id = selected_doctor.id
    
    # Create appointment
    db.collection("appointments").document(appointment_id).set({
        "appointment_id": appointment_id,
        "hospital_id": appointment.hospital_id,
        "department_id": appointment.department_id,
        "doctor_id": doctor_id,
        "patient_id": patient_id,
        "appointment_date": appointment.appointment_date,
        "priority": appointment.priority,
        "status": "booked",
        "is_walk_in": True,
        "created_at": datetime.now().isoformat()
    })
    
    # Generate token
    token_number = generate_token_number()
    
    # Create OPD queue entry
    db.collection("opd_queue").document(token_number).set({
        "token_id": token_number,
        "appointment_id": appointment_id,
        "hospital_id": appointment.hospital_id,
        "department_id": appointment.department_id,
        "doctor_id": doctor_id,
        "patient_id": patient_id,
        "patient_name": appointment.patient_name,
        "priority": appointment.priority,
        "status": "waiting",
        "opd_date": appointment.appointment_date,
        "token_time": datetime.now().isoformat()
    })
    
    return {
        "message": "Walk-in appointment booked",
        "appointment_id": appointment_id,
        "token_id": token_number,
        "doctor_id": doctor_id
    }

@router.post("/")
def create_appointment(appointment: AppointmentCreate, bed_id: str = None):
    """Create appointment and generate OPD token. Optionally reserve a bed."""
    from uuid import uuid4
    appointment_id = str(uuid4())
    
    # Auto-assign doctor if not provided
    doctor_id = appointment.doctor_id
    if not doctor_id:
        doctors = list(db.collection("doctors")
            .where("hospital_id", "==", appointment.hospital_id)
            .where("department_id", "==", appointment.department_id)
            .where("availability", "==", "available")
            .stream())
        
        if not doctors:
            raise HTTPException(status_code=404, detail="No available doctors")
        
        # Load balancing
        today = date.today().isoformat()
        min_load = float("inf")
        selected_doctor = None
        
        for doc in doctors:
            load = len(list(db.collection("opd_queue")
                .where("doctor_id", "==", doc.id)
                .where("status", "==", "waiting")
                .where("opd_date", "==", today)
                .stream()))
            if load < min_load:
                min_load = load
                selected_doctor = doc
        
        doctor_id = selected_doctor.id
    
    # Create appointment
    db.collection("appointments").document(appointment_id).set({
        "appointment_id": appointment_id,
        "hospital_id": appointment.hospital_id,
        "department_id": appointment.department_id,
        "doctor_id": doctor_id,
        "patient_id": appointment.patient_id,
        "family_member_id": appointment.family_member_id,
        "appointment_date": appointment.appointment_date.isoformat(),
        "priority": appointment.priority,
        "status": "booked",
        "bed_id": bed_id,
        "created_at": datetime.now().isoformat()
    })
    
    # Generate easy token number
    token_number = generate_token_number()
    
    # Create OPD token with token_number as document ID
    db.collection("opd_queue").document(token_number).set({
        "token_id": token_number,
        "appointment_id": appointment_id,
        "hospital_id": appointment.hospital_id,
        "department_id": appointment.department_id,
        "doctor_id": doctor_id,
        "patient_id": appointment.patient_id,
        "priority": appointment.priority,
        "status": "waiting",
        "opd_date": appointment.appointment_date.isoformat(),
        "token_time": datetime.now().isoformat()
    })
    
    # Reserve bed if requested
    reserved_bed = None
    if bed_id:
        bed_ref = db.collection("bed_management").document(bed_id)
        bed_doc = bed_ref.get()
        if bed_doc.exists and bed_doc.to_dict().get("status") == "available":
            bed_ref.update({
                "status": "reserved",
                "patient_id": appointment.patient_id,
                "appointment_id": appointment_id,
                "updated_at": datetime.now().isoformat()
            })
            reserved_bed = bed_doc.to_dict()
        else:
            raise HTTPException(status_code=400, detail="Selected bed is no longer available")

    return {
        "message": "Appointment booked and OPD token generated",
        "appointment_id": appointment_id,
        "token_id": token_number,
        "doctor_id": doctor_id,
        "bed_reserved": reserved_bed is not None,
        "bed_number": reserved_bed.get("bed_number") if reserved_bed else None,
        "bed_type": reserved_bed.get("bed_type") if reserved_bed else None,
        "ward_number": reserved_bed.get("ward_number") if reserved_bed else None
    }

@router.get("/")
def get_appointments():
    return [{**doc.to_dict(), "appointment_id": doc.id} for doc in db.collection("appointments").stream()]

@router.get("/by-patient/{patient_id}")
def get_patient_appointments(patient_id: str):
    """Get all appointments for a patient and their family members"""
    print(f"Fetching appointments for patient: {patient_id}")
    
    # Get family member IDs
    family_members = list(db.collection("family_members").where("user_id", "==", patient_id).stream())
    patient_ids = [patient_id] + [fm.id for fm in family_members]
    
    print(f"Searching for patient IDs: {patient_ids}")
    
    # Get all appointments for patient and family
    all_appointments = []
    for pid in patient_ids:
        appointments = db.collection("appointments").where("patient_id", "==", pid).stream()
        for doc in appointments:
            appt = doc.to_dict()
            appt["appointment_id"] = doc.id
            
            # Get patient/family member name
            if pid == patient_id:
                appt["patient_name"] = "Self"
            else:
                fm_doc = db.collection("family_members").document(pid).get()
                if fm_doc.exists:
                    appt["patient_name"] = fm_doc.to_dict().get("name", "Family Member")
            
            # Get hospital name
            try:
                hospital_doc = db.collection("hospitals").document(appt["hospital_id"]).get()
                if hospital_doc.exists:
                    appt["hospital_name"] = hospital_doc.to_dict().get("hospital_name", "Unknown Hospital")
                else:
                    appt["hospital_name"] = "Unknown Hospital"
            except Exception as e:
                appt["hospital_name"] = "Unknown Hospital"
            
            # Get department name
            try:
                dept_doc = db.collection("master_departments").document(appt["department_id"]).get()
                if dept_doc.exists:
                    appt["department_name"] = dept_doc.to_dict().get("department_name", "Unknown Department")
                else:
                    appt["department_name"] = "Unknown Department"
            except Exception as e:
                appt["department_name"] = "Unknown Department"
            
            # Get doctor name
            try:
                doctor_doc = db.collection("doctors").document(appt["doctor_id"]).get()
                if doctor_doc.exists:
                    appt["doctor_name"] = doctor_doc.to_dict().get("name", "Unknown Doctor")
                else:
                    appt["doctor_name"] = "Unknown Doctor"
            except Exception as e:
                appt["doctor_name"] = "Unknown Doctor"
            
            # Get token from opd_queue
            try:
                tokens = list(db.collection("opd_queue").where("appointment_id", "==", doc.id).stream())
                if tokens:
                    appt["token_id"] = tokens[0].id
                    appt["token_status"] = tokens[0].to_dict().get("status")
            except Exception as e:
                pass
            
            all_appointments.append(appt)
    
    # Sort: current (waiting) first, then by date descending
    today = date.today().isoformat()
    all_appointments.sort(key=lambda x: (
        0 if x.get("token_status") == "waiting" and x.get("appointment_date") >= today else 1,
        -1 if x.get("appointment_date") else 0,
        x.get("appointment_date", "")
    ), reverse=True)
    
    print(f"Returning {len(all_appointments)} appointments")
    return all_appointments

@router.put("/{appointment_id}")
def update_appointment(appointment_id: str, status: str):
    db.collection("appointments").document(appointment_id).update({"status": status})
    return {"message": "Appointment updated"}

@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: str):
    db.collection("appointments").document(appointment_id).delete()
    return {"message": "Appointment deleted"}
