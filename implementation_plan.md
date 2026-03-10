# Implementation Plan: Hospital, Pharmacy, & Admin Modules

This document outlines the changes needed to support the new features requested for the Smart e-Hospital system.
The MVP already has Authentication, Patient Portal, and Doctors. We are augmenting the existing backend and adding three complete dashboards entirely.

## User Review Required

> [!WARNING]
> The backend already has some partially implemented files ([beds.py](file:///c:/Users/priya/OneDrive/Desktop/e-hospital/backend/app/routes/beds.py), [admin_analytics.py](file:///c:/Users/priya/OneDrive/Desktop/e-hospital/backend/app/routes/admin_analytics.py), [alerts.py](file:///c:/Users/priya/OneDrive/Desktop/e-hospital/backend/app/routes/alerts.py), etc.) which do *not* match the new schema structure you provided in the prompt exactly (e.g. [beds.py](file:///c:/Users/priya/OneDrive/Desktop/e-hospital/backend/app/routes/beds.py) tracks occupancy at a hospital level, but the prompt specs `bed_management` at an individual bed level with `bed_id`, `ward_number`, etc.). 
> **Are you okay with me overhauling/replacing these partial implementations to strictly match the new schemas you provided?**

## Proposed Changes

### Backend Updates (FastAPI + Firestore)

#### [MODIFY] backend/app/models/schemas.py
- Add/update Pydantic schemas for the new collections to match prompt specifications exactly:
  - `BedManagement`
  - `PharmacyInventory`
  - `PharmacyQueue`
  - `Notification`

#### [NEW] backend/app/routes/bed_management.py
- Implement CRUD for individual beds within a hospital.
- Endpoints to fetch available beds, mark occupied, mark reserved.

#### [NEW/MODIFY] backend/app/routes/pharmacy.py
- Implement endpoints for `pharmacy_inventory` (add stock, low stock alerts).
- Implement endpoints for `pharmacy_queue` (fetch queue, update status: preparing -> ready -> collected).
- Implement Demand Analytics (daily usage, most used).

#### [NEW/MODIFY] backend/app/routes/notifications.py
- Implement generic alert system (`bed_alert`, [pharmacy_alert](file:///c:/Users/priya/OneDrive/Desktop/e-hospital/backend/app/routes/admin_analytics.py#74-88), `system`).
- Endpoint to fetch alerts by hospital_id.

#### [MODIFY] backend/app/routes/hospital.py (or opd.py)
- Implement Hospital Overview statistics endpoint (Combining data from doctors, beds, opd_queue).
- Implement Doctor Load Monitoring endpoint based on the `load <= 5 (Normal), 5-10 (Moderate), >10 (Overloaded)` logic.
- Add OPD Queue Management actions (Start, Complete, Skip).

#### [MODIFY] backend/app/routes/admin.py (Admin Dashboard backend)
- Implement City-Level Hospital Monitoring endpoint.
- Implement System Analytics (Total hospitals, doctors, patients, etc.).
- Consolidate Department & Doctor management (add/remove) if not already fully supported.

---

### Frontend Updates (React - e-hospital-dashboard)

#### [NEW] src/hospital/pages/HospitalDashboard.jsx
- **Hospital Overview Panel**: Display stats from the backend.
- **Doctor Load Monitoring**: Display doctors and their calculated load status with color coding (Green/Yellow/Red).
- **OPD Queue Management**: Table/List of patients with action buttons (Start, Complete, Skip).
- **Bed Management Panel**: Visual grid/list of beds (Green: Available, Yellow: Reserved, Red: Occupied).
- **Emergency Case Monitoring**: Special panel tracking emergency tokens.

#### [NEW] src/pharmacy/pages/PharmacyDashboard.jsx
- **Pharmacy Queue**: Table tracking prescriptions to prepare. Update status buttons.
- **Inventory Management**: Grid of medicines with low stock/expired highlights.
- **Demand Analytics**: Simple charts or tables.

#### [NEW] src/admin/pages/AdminDashboard.jsx
- **City-Level Hospital Monitoring**: Table of hospitals across the network.
- **System Analytics**: High-level KPI cards.
- **Master Management**: UIs to add/remove doctors and departments.
- **Alert System**: UI to broadcast notifications.

#### [MODIFY] routing and navigation
- Ensure routing protects these dashboards appropriately, based on user roles if available, or just general routing setup.

## Verification Plan

### Automated Tests
_No automated tests currently exist in the codebase._

### Manual Verification
1. **Backend Verification**: Use FastAPI's Swagger UI (`http://localhost:8000/docs`) or Thunder Client to manually test the new endpoints.
   - Create a bed.
   - Fetch hospital overview stats.
   - Add to pharmacy queue and update status.
   - Trigger a notification.
2. **Frontend UI/UX Verification**: 
   - Start the Vite/React dev server.
   - Navigate to `/hospital/dashboard`, `/pharmacy/dashboard`, and `/admin/dashboard`.
   - Verify layout matches the Dark Blue (#0b1f3a) theme.
   - Verify status colors applied correctly (Green/Yellow/Red).
   - Test interaction flow: e.g. Clicking "Mark Completed" on the OPD Queue in the Hospital Dashboard updates the state successfully without crashing.
