from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, date

# ==================== USER & AUTHENTICATION ====================
class UserCreate(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    role: Literal["patient", "hospital_admin", "pharmacy_admin", "super_admin"]

class User(BaseModel):
    user_id: str
    name: str
    email: str
    phone: str
    role: str
    created_at: datetime
    is_active: bool = True

# ==================== HOSPITAL ====================
class HospitalCreate(BaseModel):
    hospital_name: str
    address: str
    city: str
    latitude: float
    longitude: float
    contact_number: str

class Hospital(BaseModel):
    hospital_id: str
    hospital_name: str
    address: str
    city: str
    latitude: float
    longitude: float
    contact_number: str
    created_by: str
    status: Literal["active", "inactive"] = "active"

# ==================== DEPARTMENT ====================
class DepartmentCreate(BaseModel):
    hospital_id: str
    department_name: str
    description: Optional[str] = None

class Department(BaseModel):
    department_id: str
    hospital_id: str
    department_name: str
    description: Optional[str] = None

# ==================== DOCTOR ====================
class DoctorCreate(BaseModel):
    hospital_id: str
    department_id: str
    name: str
    specialization: str
    max_daily_opd: Optional[int] = None

class Doctor(BaseModel):
    doctor_id: str
    hospital_id: str
    department_id: str
    name: str
    specialization: str
    availability: Literal["available", "unavailable"] = "available"
    max_daily_opd: Optional[int] = None
    created_at: datetime

# ==================== PATIENT ====================
class PatientCreate(BaseModel):
    user_id: str
    name: str
    age: int
    gender: Literal["male", "female", "other"]
    blood_group: str
    phone: str

class Patient(BaseModel):
    patient_id: str
    user_id: str
    name: str
    age: int
    gender: str
    blood_group: str
    phone: str
    created_at: datetime

# ==================== FAMILY MEMBER ====================
class FamilyMemberCreate(BaseModel):
    patient_id: str
    name: str
    age: int
    gender: Literal["male", "female", "other"]
    blood_group: str
    relation: str

class FamilyMember(BaseModel):
    family_member_id: str
    patient_id: str
    name: str
    age: int
    gender: str
    blood_group: str
    relation: str

# ==================== APPOINTMENT ====================
class AppointmentCreate(BaseModel):
    hospital_id: str
    department_id: str
    doctor_id: Optional[str] = None
    patient_id: str
    family_member_id: Optional[str] = None
    appointment_date: date
    priority: Literal["normal", "elder", "emergency"] = "normal"

class Appointment(BaseModel):
    appointment_id: str
    hospital_id: str
    department_id: str
    doctor_id: Optional[str] = None
    patient_id: str
    family_member_id: Optional[str] = None
    appointment_date: date
    priority: str
    status: Literal["booked", "cancelled", "completed"] = "booked"
    created_at: datetime

# ==================== OPD QUEUE ====================
class OPDQueueCreate(BaseModel):
    appointment_id: str
    hospital_id: str
    department_id: str
    doctor_id: str
    patient_id: str
    priority: Literal["normal", "elder", "emergency"]
    opd_date: date

class OPDQueue(BaseModel):
    token_id: str
    appointment_id: str
    hospital_id: str
    department_id: str
    doctor_id: str
    patient_id: str
    priority: str
    status: Literal["waiting", "completed"] = "waiting"
    opd_date: date
    token_time: datetime

# ==================== BED ====================
class BedUpdate(BaseModel):
    total_beds: int
    available_beds: int

class Bed(BaseModel):
    hospital_id: str
    total_beds: int
    available_beds: int
    status: Literal["green", "yellow", "red"]
    last_updated: datetime

# ==================== PHARMACY ====================
class PharmacyCreate(BaseModel):
    hospital_id: str
    admin_user_id: str
    pharmacy_name: str
    contact_number: str

class Pharmacy(BaseModel):
    pharmacy_id: str
    hospital_id: str
    admin_user_id: str
    pharmacy_name: str
    contact_number: str

# ==================== MEDICINE ====================
class MedicineCreate(BaseModel):
    pharmacy_id: str
    medicine_name: str
    stock_quantity: int
    threshold_limit: int

class Medicine(BaseModel):
    medicine_id: str
    pharmacy_id: str
    medicine_name: str
    stock_quantity: int
    threshold_limit: int
    last_updated: datetime

# ==================== ALERT ====================
class AlertCreate(BaseModel):
    hospital_id: str
    type: Literal["bed", "medicine", "opd", "doctor"]
    message: str
    severity: Literal["info", "warning", "critical"]

class Alert(BaseModel):
    alert_id: str
    hospital_id: str
    type: str
    message: str
    severity: str
    created_at: datetime
