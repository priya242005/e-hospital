from fastapi import APIRouter, HTTPException, Depends
from app.firebase import db
from datetime import datetime
import uuid
from typing import List

from app.models.schemas import Notification, NotificationCreate
from app.auth_utils import get_current_user, require_role

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications & Alerts"]
)

@router.post("/", response_model=Notification)
def create_notification(
    notif_data: NotificationCreate,
    current_user: dict = Depends(require_role(["super_admin", "admin", "hospital_admin", "pharmacy_admin"]))
):
    notification_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    new_notif = {
        **notif_data.dict(),
        "notification_id": notification_id,
        "created_at": now
    }
    
    db.collection("notifications").document(notification_id).set(new_notif)
    return new_notif

@router.get("/{hospital_id}", response_model=List[Notification])
def get_notifications(
    hospital_id: str,
    current_user: dict = Depends(require_role(["admin", "super_admin", "hospital_admin", "pharmacy_admin"]))
):
    # Depending on role, we might want to filter, but for now we'll fetch all alerts for the hospital
    notifs_query = db.collection("notifications").where("hospital_id", "==", hospital_id).stream()
    
    notifs = []
    for doc in notifs_query:
        notifs.append(doc.to_dict())
        
    return notifs

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: str,
    current_user: dict = Depends(require_role(["super_admin", "admin", "hospital_admin"]))
):
    doc_ref = db.collection("notifications").document(notification_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    doc_ref.delete()
    return {"message": "Notification deleted successfully"}
