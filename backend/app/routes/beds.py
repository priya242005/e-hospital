from fastapi import APIRouter, HTTPException, Depends
from app.firebase import db
from datetime import datetime
import uuid
from typing import List

from app.models.schemas import BedManagement, BedManagementCreate
from app.auth_utils import get_current_user, require_role

router = APIRouter(
    prefix="/beds",
    tags=["Bed Management"]
)

# -------------------- CREATE BED (Admin/Hospital) --------------------
@router.post("/", response_model=BedManagement)
def create_bed(
    bed_data: BedManagementCreate,
    current_user: dict = Depends(require_role(["hospital_admin", "admin"]))
):
    bed_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    new_bed = {
        **bed_data.dict(),
        "bed_id": bed_id,
        "updated_at": now
    }
    
    db.collection("bed_management").document(bed_id).set(new_bed)
    return new_bed

# -------------------- GET ALL BEDS BY HOSPITAL --------------------
@router.get("/", response_model=List[BedManagement])
def get_beds(hospital_id: str, current_user: dict = Depends(get_current_user)):
    beds_query = db.collection("bed_management").where("hospital_id", "==", hospital_id).stream()
    beds = []
    for doc in beds_query:
        beds.append(doc.to_dict())
    return beds

# -------------------- PATIENT: GET AVAILABLE BEDS FOR HOSPITAL --------------------
@router.get("/available/{hospital_id}")
def get_available_beds(hospital_id: str):
    """Returns available beds grouped by type for patient admission booking."""
    beds = list(db.collection("bed_management").where("hospital_id", "==", hospital_id).where("status", "==", "available").stream())
    result = []
    for b in beds:
        data = b.to_dict()
        result.append({
            "bed_id": data.get("bed_id"),
            "bed_number": data.get("bed_number"),
            "ward_number": data.get("ward_number"),
            "bed_type": data.get("bed_type")
        })
    return result

# -------------------- HOSPITAL: GET RESERVED BEDS WITH PATIENT INFO --------------------
@router.get("/reserved/{hospital_id}")
def get_reserved_beds(hospital_id: str, current_user: dict = Depends(get_current_user)):
    """Returns reserved beds with patient and appointment details for hospital staff to confirm."""
    beds = list(db.collection("bed_management")
        .where("hospital_id", "==", hospital_id)
        .where("status", "==", "reserved")
        .stream())
    result = []
    for b in beds:
        data = b.to_dict()
        bed_id = data.get("bed_id")
        patient_id = data.get("patient_id")
        appointment_id = data.get("appointment_id")

        # Enrich with patient name
        patient_name = "Unknown"
        if patient_id:
            for col in ["family_members", "users", "walk_in_patients"]:
                doc = db.collection(col).document(patient_id).get()
                if doc.exists:
                    d = doc.to_dict()
                    patient_name = d.get("name") or d.get("patient_name", "Unknown")
                    break

        # Enrich with appointment date and priority
        appointment_date = None
        priority = None
        if appointment_id:
            appt = db.collection("appointments").document(appointment_id).get()
            if appt.exists:
                appt_data = appt.to_dict()
                appointment_date = appt_data.get("appointment_date")
                priority = appt_data.get("priority")

        result.append({
            "bed_id": bed_id,
            "bed_number": data.get("bed_number"),
            "ward_number": data.get("ward_number"),
            "bed_type": data.get("bed_type"),
            "patient_id": patient_id,
            "patient_name": patient_name,
            "appointment_id": appointment_id,
            "appointment_date": appointment_date,
            "priority": priority,
            "reserved_at": data.get("reserved_at") or data.get("updated_at")
        })
    return result

# -------------------- ADMIN: GET BED SUMMARY PER HOSPITAL --------------------
@router.get("/admin/summary")
def get_beds_admin_summary():
    """Returns aggregated bed stats per hospital for admin dashboard. No auth required."""
    hospitals = list(db.collection("hospitals").stream())
    result = []
    for hospital in hospitals:
        hospital_id = hospital.id
        h_data = hospital.to_dict()
        beds = list(db.collection("bed_management").where("hospital_id", "==", hospital_id).stream())
        total = len(beds)
        available = sum(1 for b in beds if b.to_dict().get("status") == "available")
        occupied = sum(1 for b in beds if b.to_dict().get("status") == "occupied")
        occupancy_pct = ((occupied / total) * 100) if total > 0 else 0
        if occupancy_pct < 60:
            status = "green"
        elif occupancy_pct < 85:
            status = "yellow"
        else:
            status = "red"
        result.append({
            "hospital_id": hospital_id,
            "hospital_name": h_data.get("hospital_name"),
            "total_beds": total,
            "available_beds": available,
            "occupied_beds": occupied,
            "status": status
        })
    return result

# -------------------- HOSPITAL: GET OCCUPIED BEDS WITH PATIENT INFO --------------------
@router.get("/occupied/{hospital_id}")
def get_occupied_beds(hospital_id: str, current_user: dict = Depends(get_current_user)):
    beds = list(db.collection("bed_management")
        .where("hospital_id", "==", hospital_id)
        .where("status", "==", "occupied")
        .stream())
    result = []
    for b in beds:
        data = b.to_dict()
        patient_id = data.get("patient_id")
        patient_name = "Unknown"
        if patient_id:
            for col in ["family_members", "users", "walk_in_patients"]:
                doc = db.collection(col).document(patient_id).get()
                if doc.exists:
                    d = doc.to_dict()
                    patient_name = d.get("name") or d.get("patient_name", "Unknown")
                    break
        result.append({
            "bed_id": data.get("bed_id"),
            "bed_number": data.get("bed_number"),
            "ward_number": data.get("ward_number"),
            "bed_type": data.get("bed_type"),
            "patient_id": patient_id,
            "patient_name": patient_name,
            "appointment_id": data.get("appointment_id"),
            "admitted_at": data.get("admitted_at"),
        })
    return result

# -------------------- PATIENT: GET BED STATUS BY APPOINTMENT --------------------
@router.get("/by-appointment/{appointment_id}")
def get_bed_by_appointment(appointment_id: str):
    beds = list(db.collection("bed_management").where("appointment_id", "==", appointment_id).stream())
    if not beds:
        return None
    data = beds[0].to_dict()
    return {
        "bed_id": data.get("bed_id"),
        "bed_number": data.get("bed_number"),
        "ward_number": data.get("ward_number"),
        "bed_type": data.get("bed_type"),
        "status": data.get("status"),
        "admitted_at": data.get("admitted_at"),
        "discharged_at": data.get("discharged_at"),
    }

# -------------------- UPDATE BED STATUS (Hospital Staff) --------------------
@router.put("/{bed_id}")
def update_bed_status(
    bed_id: str,
    status: str = None,
    patient_id: str = None,
    discharge_note: str = None
):
    bed_ref = db.collection("bed_management").document(bed_id)
    bed_doc = bed_ref.get()
    if not bed_doc.exists:
        raise HTTPException(status_code=404, detail="Bed not found")

    now = datetime.utcnow().isoformat()
    updates = {"updated_at": now}

    if status:
        if status not in ["available", "occupied", "reserved"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        updates["status"] = status
        if status == "occupied":
            updates["admitted_at"] = now
        if status == "reserved":
            updates["reserved_at"] = now
        if status == "available":  # discharge
            updates["discharged_at"] = now
            updates["discharge_note"] = discharge_note or ""
            updates["patient_id"] = None
            updates["appointment_id"] = None
    if patient_id:
        updates["patient_id"] = patient_id

    bed_ref.update(updates)
    return {"message": "Bed updated", "bed_id": bed_id}
