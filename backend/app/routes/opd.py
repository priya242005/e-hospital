from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.firebase import db
import time
import uuid
from datetime import date
from app.auth_utils import get_current_user, require_role

router = APIRouter(
    prefix="/opd",
    tags=["OPD"]
)

# -------------------- CONFIG --------------------

AVG_CONSULT_TIME = 7  # minutes per patient

PRIORITY_ORDER = {
    "emergency": 0,
    "elder": 1,
    "normal": 2
}

# -------------------- REQUEST MODEL --------------------

from typing import Optional

class OPDRequest(BaseModel):
    user_id: str
    patient_id: str
    hospital_id: str
    department: str
    doctor_id: Optional[str] = None
    priority: str = "normal"
    auto_assign: bool = False

# -------------------- ADD TO OPD QUEUE --------------------

@router.post("/")
def add_to_opd(data: OPDRequest):
    print("OPD REQUEST RECEIVED:", data.dict())
    today = date.today().isoformat()

    # Generate token
    token = uuid.uuid4().hex[:8]

    # Save to OPD queue
    db.collection("opd_queue").document(token).set({
        "user_id": data.user_id,
        "patient_id": data.patient_id,
        "hospital_id": data.hospital_id,
        "department": data.department,
        "doctor_id": data.doctor_id,
        "priority": data.priority,
        "status": "waiting",
        "token_time": int(time.time()),
        "opd_date": today
    })

    # Calculate patients ahead (dummy calculation for now)
    patients_ahead = 0

    return {
        "token": token,
        "doctor_id": data.doctor_id,
        "patients_ahead": patients_ahead,
        "expected_waiting_time_min": patients_ahead * AVG_CONSULT_TIME
    }

# -------------------- VIEW TODAY OPD QUEUE --------------------

@router.get("/")
def view_today_opd_queue(user_id: str = None):
    today = date.today().isoformat()

    query = db.collection("opd_queue")
    if user_id:
        query = query.where("user_id", "==", user_id)
    
    docs = list(query.where("opd_date", "==", today).stream())

    result = []
    for doc in docs:
        data = doc.to_dict()
        data["token"] = doc.id
        result.append(data)

    return result

# -------------------- GET WAITING TIME BY TOKEN --------------------

@router.get("/waiting-time/{token_id}")
def get_waiting_time(token_id: str):
    today = date.today().isoformat()
    
    # Get the current token's data
    token_doc = db.collection("opd_queue").document(token_id).get()
    if not token_doc.exists:
        raise HTTPException(status_code=404, detail="Token not found or consultation completed")
    
    token_data = token_doc.to_dict()
    if token_data.get("status") != "waiting":
        raise HTTPException(status_code=404, detail="Consultation completed")
    
    # Get all waiting patients for the same doctor on the same date
    docs = list(
        db.collection("opd_queue")
        .where("doctor_id", "==", token_data.get("doctor_id"))
        .where("status", "==", "waiting")
        .where("opd_date", "==", today)
        .stream()
    )

    # Sort by priority and token_time
    docs.sort(
        key=lambda d: (
            PRIORITY_ORDER.get(d.to_dict().get("priority", "normal"), 2),
            d.to_dict().get("token_time", "")
        )
    )

    # Find position in queue
    for index, doc in enumerate(docs):
        if doc.id == token_id:
            return {
                "token_id": token_id,
                "doctor_id": token_data.get("doctor_id"),
                "priority": token_data.get("priority"),
                "patients_ahead": index,
                "expected_waiting_time_min": index * AVG_CONSULT_TIME
            }

    raise HTTPException(status_code=404, detail="Token not found in queue")

# -------------------- MANAGE CONSULTATION STATUS --------------------

@router.put("/{token_id}/status")
def update_opd_status(
    token_id: str, 
    status: str,
    current_user: dict = Depends(require_role(["hospital", "hospital_admin", "doctor", "admin"]))
):
    if status not in ["started", "completed", "skipped", "waiting"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    doc_ref = db.collection("opd_queue").document(token_id)

    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Token not found")

    doc_ref.update({"status": status})
    return {"message": f"Consultation marked as {status}"}

@router.get("/doctor/{doctor_id}")
def get_doctor_queue(doctor_id: str, current_user: dict = Depends(get_current_user)):
    """Get today's full OPD queue for a specific doctor with position, waiting time, and bed info."""
    today = date.today().isoformat()

    docs = list(
        db.collection("opd_queue")
        .where("doctor_id", "==", doctor_id)
        .where("opd_date", "==", today)
        .stream()
    )

    result = []
    for doc in docs:
        data = doc.to_dict()
        data["token_id"] = doc.id

        # Enrich patient name
        if not data.get("patient_name") and data.get("patient_id"):
            for col in ["family_members", "users", "walk_in_patients"]:
                pdoc = db.collection(col).document(data["patient_id"]).get()
                if pdoc.exists:
                    data["patient_name"] = pdoc.to_dict().get("name", "Patient")
                    break

        # Enrich bed info for this patient
        if data.get("patient_id"):
            beds = list(
                db.collection("bed_management")
                .where("patient_id", "==", data["patient_id"])
                .stream()
            )
            for bed in beds:
                bd = bed.to_dict()
                if bd.get("status") in ("reserved", "occupied"):
                    data["bed_number"] = bd.get("bed_number")
                    data["ward_number"] = bd.get("ward_number")
                    data["bed_type"] = bd.get("bed_type")
                    data["bed_status"] = bd.get("status")
                    break

        result.append(data)

    # Separate waiting vs completed
    waiting = [r for r in result if r.get("status") == "waiting"]
    completed = [r for r in result if r.get("status") != "waiting"]

    # Sort waiting by priority then token_time
    waiting.sort(key=lambda x: (
        PRIORITY_ORDER.get(x.get("priority", "normal"), 2),
        x.get("token_time", 0)
    ))

    # Assign position and waiting time
    for i, item in enumerate(waiting):
        item["position"] = i + 1
        item["waiting_minutes"] = i * AVG_CONSULT_TIME

    for item in completed:
        item["position"] = None
        item["waiting_minutes"] = 0

    return {
        "waiting": waiting,
        "completed": completed,
        "total_today": len(result),
        "waiting_count": len(waiting),
        "completed_count": len(completed)
    }

@router.get("/doctor/{doctor_id}/history")
def get_doctor_history(doctor_id: str, current_user: dict = Depends(get_current_user)):
    """All-time completed patients for a doctor across all dates."""
    docs = list(
        db.collection("opd_queue")
        .where("doctor_id", "==", doctor_id)
        .where("status", "==", "completed")
        .stream()
    )

    result = []
    for doc in docs:
        data = doc.to_dict()
        data["token_id"] = doc.id

        if not data.get("patient_name") and data.get("patient_id"):
            for col in ["family_members", "users", "walk_in_patients"]:
                pdoc = db.collection(col).document(data["patient_id"]).get()
                if pdoc.exists:
                    data["patient_name"] = pdoc.to_dict().get("name", "Patient")
                    break

        # Department name
        if data.get("department_id"):
            ddoc = db.collection("master_departments").document(data["department_id"]).get()
            if ddoc.exists:
                data["department_name"] = ddoc.to_dict().get("department_name", "")

        result.append(data)

    result.sort(key=lambda x: x.get("opd_date", ""), reverse=True)
    return result

@router.get("/queue/{hospital_id}")
def get_hospital_opd_queue(hospital_id: str, current_user: dict = Depends(get_current_user)):
    """Get OPD queue for a specific hospital"""
    today = date.today().isoformat()
    
    queue_docs = db.collection("opd_queue") \
        .where("hospital_id", "==", hospital_id) \
        .where("opd_date", "==", today) \
        .stream()
    
    result = []
    for doc in queue_docs:
        data = doc.to_dict()
        data["token_id"] = doc.id
        
        # Check if patient_name is already in the document (walk-in patients)
        if not data.get("patient_name") and data.get("patient_id"):
            # Try family_members collection first
            patient_doc = db.collection("family_members").document(data["patient_id"]).get()
            if patient_doc.exists:
                data["patient_name"] = patient_doc.to_dict().get("name")
            else:
                # Try walk_in_patients collection
                walk_in_doc = db.collection("walk_in_patients").document(data["patient_id"]).get()
                if walk_in_doc.exists:
                    data["patient_name"] = walk_in_doc.to_dict().get("name")
        
        if data.get("doctor_id"):
            doctor_doc = db.collection("doctors").document(data["doctor_id"]).get()
            if doctor_doc.exists:
                data["doctor_name"] = doctor_doc.to_dict().get("name")
        
        result.append(data)
    
    # Sort by priority and time
    result.sort(key=lambda x: (PRIORITY_ORDER.get(x.get("priority", "normal"), 2), x.get("token_time", 0)))
    
    return result

@router.put("/{token_id}")
def update_consultation_status(token_id: str, status: str = "completed", current_user: dict = Depends(get_current_user)):
    """Update consultation status - simplified for hospital dashboard"""
    doc_ref = db.collection("opd_queue").document(token_id)
    
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Token not found")
    
    doc_ref.update({"status": status})
    return {"message": f"Consultation marked as {status}"}
