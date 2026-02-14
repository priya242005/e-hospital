from fastapi import APIRouter, HTTPException
from app.firebase import db
import time
from datetime import date

router = APIRouter(
    prefix="/opd",
    tags=["OPD"]
)

AVG_CONSULT_TIME = 7

PRIORITY_ORDER = {
    "emergency": 0,
    "elder": 1,
    "normal": 2
}

@router.post("/")
def add_to_opd(
    patient_id: str,
    appointment_id: str,
    hospital_id: str,
    department: str,
    priority: str = "normal"
):
    today = date.today().isoformat()

    doctors = list(
        db.collection("doctors")
        .where("hospital_id", "==", hospital_id)
        .where("department", "==", department)
        .where("availability", "==", "available")
        .stream()
    )

    if not doctors:
        raise HTTPException(status_code=404, detail="No doctors available")

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

    token = int(time.time())

    db.collection("opd_queue").document(str(token)).set({
        "patient_id": patient_id,
        "appointment_id": appointment_id,
        "doctor_id": assigned_doctor,
        "priority": priority,
        "status": "waiting",
        "token_time": token,
        "opd_date": today
    })

    return {
        "token": token,
        "doctor_id": assigned_doctor,
        "expected_waiting_time_min": min_load * AVG_CONSULT_TIME
    }


# -------------------- VIEW TODAY'S OPD QUEUE --------------------
@router.get("/")
def view_today_opd_queue():
    today = date.today().isoformat()

    docs = list(
        db.collection("opd_queue")
        .where("status", "==", "waiting")
        .where("opd_date", "==", today)
        .stream()
    )

    docs.sort(
        key=lambda d: (
            PRIORITY_ORDER.get(d.to_dict().get("priority", "normal")),
            d.to_dict()["token_time"]
        )
    )

    result = []
    for index, doc in enumerate(docs):
        data = doc.to_dict()
        data["token"] = doc.id
        data["position"] = index + 1
        data["patients_ahead"] = index
        data["expected_waiting_time_min"] = index * AVG_CONSULT_TIME
        result.append(data)

    return result


# -------------------- GET WAITING TIME FOR A SPECIFIC TOKEN --------------------
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
            PRIORITY_ORDER.get(d.to_dict().get("priority", "normal")),
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

    raise HTTPException(status_code=404, detail="Token not found or already completed")


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
