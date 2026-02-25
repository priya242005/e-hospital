from fastapi import APIRouter
from app.firebase import db
import uuid

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)

@router.post("/")
def create_alert(
    hospital_id: str,
    alert_type: str,
    message: str
):
    alert_id = str(uuid.uuid4())
    
    db.collection("alerts").add({
        "alert_id": alert_id,
        "hospital_id": hospital_id,
        "type": alert_type,
        "message": message
    })
    return {"message": "Alert created successfully", "alert_id": alert_id}


@router.get("/")
def get_alerts():
    alerts = []
    for doc in db.collection("alerts").stream():
        data = doc.to_dict()
        data["alert_id"] = doc.id
        alerts.append(data)
    return alerts
