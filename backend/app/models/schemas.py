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

# ==================== BED MANAGEMENT ====================
class BedManagementCreate(BaseModel):
    hospital_id: str
    ward_number: str
    bed_type: Literal["general", "icu", "emergency"]
    status: Literal["available", "occupied", "reserved"] = "available"
    patient_id: Optional[str] = None

class BedManagement(BedManagementCreate):
    bed_id: str
    updated_at: datetime

# ==================== PHARMACY INVENTORY ====================
class PharmacyInventoryCreate(BaseModel):
    hospital_id: str
    medicine_name: str
    stock_quantity: int
    minimum_threshold: int
    expiry_date: date

class PharmacyInventory(PharmacyInventoryCreate):
    medicine_id: str
    last_updated: datetime

# ==================== PHARMACY QUEUE ====================
class PharmacyQueueCreate(BaseModel):
    token_id: str
    patient_id: str
    hospital_id: str
    medicine_list: list[str]
    pharmacy_token: int
    status: Literal["preparing", "ready", "collected"] = "preparing"
    estimated_wait_time: int

class PharmacyQueue(PharmacyQueueCreate):
    prescription_id: str
    created_at: datetime

# ==================== NOTIFICATIONS ====================
class NotificationCreate(BaseModel):
    hospital_id: str
    type: Literal["bed_alert", "pharmacy_alert", "system"]
    message: str
    priority: Literal["low", "medium", "high"]

class Notification(NotificationCreate):
    notification_id: str
    created_at: datetime
