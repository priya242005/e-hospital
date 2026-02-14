from fastapi import APIRouter
from app.firebase import db
from datetime import date

router = APIRouter(
    prefix="/admin",
    tags=["Admin Analytics"]
)

# -------------------- OPD LOAD ANALYTICS --------------------
@router.get("/opd-load")
def opd_load():
    today = date.today().isoformat()
    queue = db.collection("opd_queue") \
              .where("opd_date", "==", today) \
              .stream()

    total = 0
    waiting = 0
    completed = 0

    for doc in queue:
        total += 1
        status = doc.to_dict()["status"]
        if status == "waiting":
            waiting += 1
        else:
            completed += 1

    return {
        "total_patients_today": total,
        "waiting": waiting,
        "completed": completed
    }


# -------------------- DOCTOR WORKLOAD ANALYTICS --------------------
@router.get("/doctor-workload")
def doctor_workload():
    today = date.today().isoformat()
    doctors = db.collection("doctors").stream()
    result = []

    for doctor in doctors:
        load = len(list(
            db.collection("opd_queue")
            .where("doctor_id", "==", doctor.id)
            .where("status", "==", "waiting")
            .where("opd_date", "==", today)
            .stream()
        ))

        result.append({
            "doctor_id": doctor.id,
            "name": doctor.to_dict().get("name"),
            "current_load": load
        })

    return result


# -------------------- BED OCCUPANCY SUMMARY --------------------
@router.get("/bed-status")
def bed_status_summary():
    beds = db.collection("beds").stream()
    summary = {"green": 0, "yellow": 0, "red": 0}

    for bed in beds:
        status = bed.to_dict().get("status", "unknown")
        if status in summary:
            summary[status] += 1

    return summary


# -------------------- PHARMACY ALERTS SUMMARY --------------------
@router.get("/pharmacy-alerts")
def pharmacy_alerts():
    alerts = db.collection("alerts") \
               .where("type", "==", "LOW_STOCK") \
               .stream()

    result = []
    for alert in alerts:
        result.append(alert.to_dict())

    return {
        "low_stock_alerts_count": len(result),
        "alerts": result
    }


# -------------------- CITY LEVEL HOSPITAL STATUS --------------------
@router.get("/city-status")
def city_status(city: str):
    hospitals = db.collection("hospitals") \
                  .where("city", "==", city) \
                  .stream()

    result = []

    for hospital in hospitals:
        bed_doc = db.collection("beds").document(hospital.id).get()
        if not bed_doc.exists:
            continue

        data = bed_doc.to_dict()
        result.append({
            "hospital_id": hospital.id,
            "hospital_name": hospital.to_dict().get("name"),
            "status": data.get("status"),
            "available_beds": data.get("available_beds", 0)
        })

    return result
