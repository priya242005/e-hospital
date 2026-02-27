from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.firebase import db
import time
import uuid
from datetime import date

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

# -------------------- COMPLETE CONSULTATION --------------------

@router.put("/{token_id}")
def complete_opd(token_id: str):
    doc_ref = db.collection("opd_queue").document(token_id)

    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Token not found")

    doc_ref.update({"status": "completed"})
    return {"message": "Consultation completed"}
