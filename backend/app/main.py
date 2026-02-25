from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
    hospital,
    users,
    doctors,
    patients,
    appointments,
    opd,
    beds,
    medicines,
    pharmacy_queue,
    alerts,
    admin_analytics,
    auth,
    patient_records,
    departments
)

app = FastAPI(title="Smart e-Hospital Management System")

# -------------------- CORS CONFIGURATION --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Frontend (localhost:3000) allowed
    allow_credentials=True,
    allow_methods=["*"],          # GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],
)

# -------------------- ROUTERS --------------------
app.include_router(auth.router)
app.include_router(patient_records.router)
app.include_router(departments.router)
app.include_router(hospital.router)
app.include_router(users.router)
app.include_router(doctors.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(opd.router)
app.include_router(beds.router)
app.include_router(medicines.router)
app.include_router(pharmacy_queue.router)
app.include_router(alerts.router)
app.include_router(admin_analytics.router)
