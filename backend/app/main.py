from fastapi import FastAPI

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
    admin_analytics
)

app = FastAPI(title="Smart e-Hospital Management System")

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
