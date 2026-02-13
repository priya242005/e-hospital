from fastapi import APIRouter
from app.firebase import db

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
    db.collection("alerts").add({
        "hospital_id": hospital_id,
        "type": alert_type,
        "message": message
    })
    return {"message": "Alert created successfully"}


@router.get("/")
def get_alerts():
    alerts = []
    for doc in db.collection("alerts").stream():
        data = doc.to_dict()
        data["alert_id"] = doc.id
        alerts.append(data)
    return alerts
