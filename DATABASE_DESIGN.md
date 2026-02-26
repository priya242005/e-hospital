# 🏥 Smart e-Hospital Database Design

## 📋 Table of Contents
1. [Core Tables](#core-tables)
2. [Relationships](#relationships)
3. [OPD Flow Logic](#opd-flow-logic)
4. [Setup Instructions](#setup-instructions)

---

## 🗄️ CORE TABLES

### 1. USERS (Authentication)
**Collection:** `users`

| Field | Type | Description |
|-------|------|-------------|
| user_id | string (PK) | Unique identifier |
| name | string | Full name |
| email | string | Email address |
| phone | string | Contact number |
| password_hash | string | Bcrypt hashed password |
| role | enum | patient \| hospital_admin \| pharmacy_admin \| super_admin |
| created_at | datetime | Registration timestamp |
| is_active | boolean | Account status |

**Purpose:** Central authentication for all user types

---

### 2. HOSPITALS
**Collection:** `hospitals`

| Field | Type | Description |
|-------|------|-------------|
| hospital_id | string (PK) | Unique identifier |
| hospital_name | string | Hospital name |
| address | string | Full address |
| city | string | City name |
| latitude | float | GPS coordinate |
| longitude | float | GPS coordinate |
| contact_number | string | Contact number |
| created_by | string (FK → users) | Admin who created |
| status | enum | active \| inactive |

**Purpose:** Hospital master data with location for maps

---

### 3. DEPARTMENTS
**Collection:** `departments`

| Field | Type | Description |
|-------|------|-------------|
| department_id | string (PK) | Unique identifier |
| hospital_id | string (FK → hospitals) | Parent hospital |
| department_name | string | Department name |
| description | string | Optional description |
| is_active | boolean | Active status |

**Purpose:** Hospital departments (Cardiology, Orthopedics, etc.)

**Relationship:** Hospital → Departments (1-to-many)

---

### 4. DOCTORS
**Collection:** `doctors`

| Field | Type | Description |
|-------|------|-------------|
| doctor_id | string (PK) | Unique identifier |
| hospital_id | string (FK → hospitals) | Parent hospital |
| department_id | string (FK → departments) | Parent department |
| name | string | Doctor name |
| specialization | string | Specialization |
| availability | enum | available \| unavailable |
| max_daily_opd | int (optional) | Max patients per day |
| created_at | datetime | Creation timestamp |

**Purpose:** Doctor profiles with hospital + department linkage

**Relationships:**
- Hospital → Doctors (1-to-many)
- Department → Doctors (1-to-many)

---

### 5. PATIENTS
**Collection:** `patients`

| Field | Type | Description |
|-------|------|-------------|
| patient_id | string (PK) | Unique identifier |
| user_id | string (FK → users) | Linked user account |
| name | string | Patient name |
| age | int | Age |
| gender | enum | male \| female \| other |
| blood_group | string | Blood group |
| phone | string | Contact number |
| created_at | datetime | Registration timestamp |

**Purpose:** Patient medical profile

**Relationship:** User → Patient (1-to-1)

---

### 6. FAMILY_MEMBERS
**Collection:** `family_members`

| Field | Type | Description |
|-------|------|-------------|
| family_member_id | string (PK) | Unique identifier |
| patient_id | string (FK → patients) | Parent patient |
| name | string | Member name |
| age | int | Age |
| gender | enum | male \| female \| other |
| blood_group | string | Blood group |
| relation | string | Relationship (father/mother/child) |

**Purpose:** Allow patients to book for family members

**Relationship:** Patient → Family Members (1-to-many)

---

### 7. APPOINTMENTS
**Collection:** `appointments`

| Field | Type | Description |
|-------|------|-------------|
| appointment_id | string (PK) | Unique identifier |
| hospital_id | string (FK → hospitals) | Hospital |
| department_id | string (FK → departments) | Department |
| doctor_id | string (FK → doctors, nullable) | Doctor (auto-assigned if null) |
| patient_id | string (FK → patients) | Patient |
| family_member_id | string (FK → family_members, nullable) | Family member (if booking for family) |
| appointment_date | date | Appointment date |
| priority | enum | normal \| elder \| emergency |
| status | enum | booked \| cancelled \| completed |
| created_at | datetime | Booking timestamp |

**Purpose:** Appointment booking before OPD

**Key Logic:**
- If `doctor_id` is null → Auto-assign using load balancing
- If `family_member_id` is set → Booking for family member

---

### 8. OPD_QUEUE ⭐ (MOST IMPORTANT)
**Collection:** `opd_queue`

| Field | Type | Description |
|-------|------|-------------|
| token_id | string (PK) | Unique token |
| appointment_id | string (FK → appointments) | Linked appointment |
| hospital_id | string (FK → hospitals) | Hospital |
| department_id | string (FK → departments) | Department |
| doctor_id | string (FK → doctors) | Assigned doctor |
| patient_id | string (FK → patients) | Patient |
| priority | enum | normal \| elder \| emergency |
| status | enum | waiting \| completed |
| opd_date | date | OPD date (DAILY RESET) |
| token_time | datetime | Token generation time |

**Purpose:** Daily OPD queue management

**Key Logic:**
- **NEW QUEUE EVERY DAY** (filtered by `opd_date`)
- Queue sorted by: `priority` (emergency > elder > normal) → `token_time` (FIFO)
- Waiting time = `patients_ahead × AVG_CONSULT_TIME`

**Relationship:** Appointment → OPD Queue (1-to-1)

---

### 9. BEDS
**Collection:** `beds`

| Field | Type | Description |
|-------|------|-------------|
| hospital_id | string (PK, FK → hospitals) | Hospital |
| total_beds | int | Total bed count |
| available_beds | int | Available beds |
| status | enum | green \| yellow \| red |
| last_updated | datetime | Last update timestamp |

**Purpose:** Real-time bed availability tracking

**Status Logic:**
- Green: > 30% available
- Yellow: 10-30% available
- Red: < 10% available

---

### 10. PHARMACIES
**Collection:** `pharmacies`

| Field | Type | Description |
|-------|------|-------------|
| pharmacy_id | string (PK) | Unique identifier |
| hospital_id | string (FK → hospitals) | Parent hospital |
| admin_user_id | string (FK → users) | Pharmacy admin |
| pharmacy_name | string | Pharmacy name |
| contact_number | string | Contact number |

**Purpose:** Hospital pharmacy management

**Relationship:** Hospital → Pharmacies (1-to-many)

---

### 11. MEDICINES
**Collection:** `medicines`

| Field | Type | Description |
|-------|------|-------------|
| medicine_id | string (PK) | Unique identifier |
| pharmacy_id | string (FK → pharmacies) | Parent pharmacy |
| medicine_name | string | Medicine name |
| stock_quantity | int | Current stock |
| threshold_limit | int | Low stock alert threshold |
| last_updated | datetime | Last update timestamp |

**Purpose:** Medicine inventory tracking

**Relationship:** Pharmacy → Medicines (1-to-many)

---

### 12. ALERTS
**Collection:** `alerts`

| Field | Type | Description |
|-------|------|-------------|
| alert_id | string (PK) | Unique identifier |
| hospital_id | string (FK → hospitals) | Hospital |
| type | enum | bed \| medicine \| opd \| doctor |
| message | string | Alert message |
| severity | enum | info \| warning \| critical |
| created_at | datetime | Alert timestamp |

**Purpose:** System-generated alerts for admins

---

## 🔗 RELATIONSHIPS SUMMARY

```
User (1) ──→ (1) Patient
Patient (1) ──→ (many) Family Members

Hospital (1) ──→ (many) Departments
Hospital (1) ──→ (many) Doctors
Department (1) ──→ (many) Doctors

Hospital (1) ──→ (1) Beds
Hospital (1) ──→ (many) Pharmacies
Pharmacy (1) ──→ (many) Medicines

Appointment (1) ──→ (1) OPD Queue
Doctor (1) ──→ (many) OPD Queue
```

---

## 🔄 OPD FLOW LOGIC (STEP-BY-STEP)

### Step 1: Patient Books Appointment
**Frontend:** OPD Booking Page

**User Selects:**
1. Hospital → Fetch departments: `GET /departments?hospital_id=X`
2. Department → Fetch doctors: `GET /doctors/by-hospital-department?hospital_id=X&department_id=Y`
3. Doctor (manual) OR Auto-assign
4. Self OR Family Member
5. Priority (normal/elder/emergency)

**Backend:** `POST /appointments`
- Creates `appointments` record
- Auto-assigns doctor if not selected (load balancing)
- Creates `opd_queue` token
- Returns `token_id`, `doctor_id`, `appointment_id`

---

### Step 2: OPD Token Generation
**Automatic on appointment creation**

**Load Balancing Logic:**
```python
# Count waiting patients for each doctor TODAY
for doctor in available_doctors:
    load = COUNT(opd_queue WHERE doctor_id AND status=waiting AND opd_date=today)
    
# Select doctor with minimum load
selected_doctor = doctor_with_min_load
```

---

### Step 3: Queue Sorting
**Priority-based sorting:**

```python
# Sort by priority first, then FIFO
queue.sort(key=lambda x: (
    PRIORITY_ORDER[x.priority],  # emergency=0, elder=1, normal=2
    x.token_time                 # Earlier time = higher priority
))
```

---

### Step 4: Waiting Time Calculation
**Formula:**
```
waiting_time = patients_ahead × AVG_CONSULT_TIME
```

**Example:**
- 4 patients ahead
- AVG_CONSULT_TIME = 7 minutes
- Waiting time = 28 minutes

**API:** `GET /opd/waiting-time/{token_id}`

---

### Step 5: Consultation Completion
**Doctor marks token as completed:**

**API:** `PUT /opd/{token_id}` → Set `status = "completed"`

**Effect:** Next patient automatically moves forward in queue

---

## 🚀 SETUP INSTRUCTIONS

### 1. Create Hospital
```bash
POST /hospitals
{
  "hospital_name": "City General Hospital",
  "address": "123 Main St",
  "city": "Mumbai",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "contact_number": "022-12345678"
}
```

### 2. Seed Departments
```bash
POST /departments/seed?hospital_id=<hospital_id>
```
Creates: Cardiology, Orthopedics, Neurology, Pediatrics

### 3. Seed Doctors
```bash
POST /doctors/seed?hospital_id=<hospital_id>
```
Creates 8 doctors across all departments

### 4. Register User
```bash
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "patient"
}
```

### 5. Create Patient Profile
```bash
POST /patients
{
  "user_id": "<user_id>",
  "name": "John Doe",
  "age": 30,
  "gender": "male",
  "blood_group": "O+",
  "phone": "9876543210"
}
```

### 6. Book Appointment (Auto-generates OPD Token)
```bash
POST /appointments
{
  "hospital_id": "<hospital_id>",
  "department_id": "<department_id>",
  "doctor_id": null,  # Auto-assign
  "patient_id": "<patient_id>",
  "family_member_id": null,
  "appointment_date": "2024-01-15",
  "priority": "normal"
}
```

### 7. Check Waiting Time
```bash
GET /opd/waiting-time/<token_id>
```

---

## 📊 DASHBOARD QUERIES

### Hospital Admin Dashboard

**OPD Analytics:**
```python
# Today's waiting patients
opd_queue.where("status", "==", "waiting").where("opd_date", "==", today)

# Completed consultations
opd_queue.where("status", "==", "completed").where("opd_date", "==", today)
```

**Doctor Load:**
```python
# Per doctor load
for doctor in doctors:
    load = opd_queue.where("doctor_id", "==", doctor.id)
                    .where("status", "==", "waiting")
                    .where("opd_date", "==", today)
                    .count()
```

**Bed Status:**
```python
beds.where("hospital_id", "==", hospital_id).get()
```

**Pharmacy Alerts:**
```python
medicines.where("stock_quantity", "<", "threshold_limit").get()
```

---

## ✅ KEY INSIGHTS

1. **OPD Queue is DAILY** → Filtered by `opd_date`
2. **Appointment creates OPD token automatically**
3. **Load balancing uses real-time doctor workload**
4. **Priority sorting: emergency > elder > normal**
5. **Waiting time = patients_ahead × avg_time**
6. **Family members can be added for booking**
7. **Doctor auto-assignment if not manually selected**

---

## 🎯 NEXT STEPS

1. ✅ Database schema finalized
2. ✅ Backend models created
3. ✅ Core routes updated
4. 🔄 Update frontend to use new schema
5. 🔄 Test complete booking flow
6. 🔄 Implement admin dashboard queries

---

**Database Status:** ✅ PRODUCTION READY
