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

class OPDRequest(BaseModel):
    patient_id: str
    appointment_id: str
    hospital_id: str
    department: str
    priority: str = "normal"  # emergency | elder | normal

# -------------------- ADD TO OPD QUEUE --------------------

@router.post("/")
def add_to_opd(data: OPDRequest):
    today = date.today().isoformat()

    # 1️⃣ Get available doctors
    doctors = list(
        db.collection("doctors")
        .where("hospital_id", "==", data.hospital_id)
        .where("department", "==", data.department)
        .where("availability", "==", "available")
        .stream()
    )

    if not doctors:
        raise HTTPException(status_code=404, detail="No doctors available")

    # 2️⃣ Find least-loaded doctor
    min_load = float("inf")
    assigned_doctor = None

    for doc in doctors:
        load = len(list(
            db.collection("opd_queue")
            .where("doctor_id", "==", doc.id)
            .where("status", "==", "waiting")
            .where("opd_date", "==", today)
            .stream()
        ))
        if load < min_load:
            min_load = load
            assigned_doctor = doc.id

    # 3️⃣ Generate safe unique token
    token = uuid.uuid4().hex[:8]

    # 4️⃣ Save to OPD queue
    db.collection("opd_queue").document(token).set({
        "patient_id": data.patient_id,
        "appointment_id": data.appointment_id,
        "hospital_id": data.hospital_id,
        "department": data.department,
        "doctor_id": assigned_doctor,
        "priority": data.priority,
        "status": "waiting",
        "token_time": int(time.time()),
        "opd_date": today
    })

    return {
        "token": token,
        "doctor_id": assigned_doctor,
        "patients_ahead": min_load,
        "expected_waiting_time_min": min_load * AVG_CONSULT_TIME
    }

# -------------------- VIEW TODAY OPD QUEUE --------------------

@router.get("/")
def view_today_opd_queue():
    today = date.today().isoformat()

    docs = list(
        db.collection("opd_queue")
        .where("status", "==", "waiting")
        .where("opd_date", "==", today)
        .stream()
    )

    # Sort by priority then FIFO
    docs.sort(
        key=lambda d: (
            PRIORITY_ORDER.get(d.to_dict().get("priority", "normal"), 2),
            d.to_dict()["token_time"]
        )
    )

    result = []
    for index, doc in enumerate(docs):
        data = doc.to_dict()
        data.update({
            "token": doc.id,
            "position": index + 1,
            "patients_ahead": index,
            "expected_waiting_time_min": index * AVG_CONSULT_TIME
        })
        result.append(data)

    return result

# -------------------- GET WAITING TIME BY TOKEN --------------------

@router.get("/waiting-time/{token}")
def get_waiting_time(token: str):
    today = date.today().isoformat()

    docs = list(
        db.collection("opd_queue")
        .where("status", "==", "waiting")
        .where("opd_date", "==", today)
        .stream()
    )

    docs.sort(
        key=lambda d: (
            PRIORITY_ORDER.get(d.to_dict().get("priority", "normal"), 2),
            d.to_dict()["token_time"]
        )
    )

    for index, doc in enumerate(docs):
        if doc.id == token:
            return {
                "token": token,
                "patients_ahead": index,
                "expected_waiting_time_min": index * AVG_CONSULT_TIME
            }

    raise HTTPException(status_code=404, detail="Token not found or consultation completed")

# -------------------- COMPLETE CONSULTATION --------------------

@router.put("/{token}")
def complete_opd(token: str):
    doc_ref = db.collection("opd_queue").document(token)

    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Token not found")

    doc_ref.update({
        "status": "completed"
    })

    return {"message": "Consultation completed"}
