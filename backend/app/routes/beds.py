from fastapi import APIRouter, HTTPException
from app.firebase import db
from datetime import date

router = APIRouter(
    prefix="/beds",
    tags=["Beds"]
)

# -------------------- CREATE / UPDATE BED STATUS --------------------
@router.post("/")
def update_beds(
    hospital_id: str,
    total_beds: int,
    occupied_beds: int
):
    if occupied_beds > total_beds:
        raise HTTPException(
            status_code=400,
            detail="Occupied beds cannot exceed total beds"
        )

    available_beds = total_beds - occupied_beds
    occupancy_percent = (occupied_beds / total_beds) * 100

    if occupancy_percent < 70:
        status = "green"
    elif occupancy_percent <= 90:
        status = "yellow"
    else:
        status = "red"

    db.collection("beds").document(hospital_id).set({
        "hospital_id": hospital_id,
        "total_beds": total_beds,
        "occupied_beds": occupied_beds,
        "available_beds": available_beds,
        "occupancy_percent": round(occupancy_percent, 2),
        "status": status,
        "last_updated": date.today().isoformat()
    })

    return {
        "hospital_id": hospital_id,
        "status": status,
        "available_beds": available_beds
    }


# -------------------- GET ALL BED STATUS (CITY / ADMIN VIEW) --------------------
@router.get("/")
def get_all_beds():
    return [
        {**doc.to_dict(), "hospital_id": doc.id}
        for doc in db.collection("beds").stream()
    ]


# -------------------- GET SINGLE HOSPITAL BED STATUS --------------------
@router.get("/{hospital_id}")
def get_bed_status(hospital_id: str):
    doc = db.collection("beds").document(hospital_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Hospital not found")

    return doc.to_dict()
