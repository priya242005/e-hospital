# 🏥 Smart e-Hospital Management System - Project Walkthrough

## 📌 Project Overview

A comprehensive healthcare management platform built with **FastAPI** (backend) and **React** (frontend), using **Firebase Firestore** for real-time data management. The system handles patient appointments, OPD queue management, hospital operations, and pharmacy inventory.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18)                      │
│  ├─ Public Dashboard (Hospital Finder, Real-time Stats)    │
│  ├─ Patient Portal (Appointments, Token Tracking)          │
│  ├─ Hospital Dashboard (OPD Queue, Bed Management)         │
│  ├─ Pharmacy Dashboard (Prescription Queue, Inventory)     │
│  ├─ Doctor Dashboard (Patient Queue)                       │
│  └─ Admin Dashboard (System-wide Analytics)                │
└─────────────────────────────────────────────────────────────┘
                            ↕ (Axios HTTP)
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI)                          │
│  ├─ Authentication (JWT + Bcrypt)                          │
│  ├─ 15+ API Route Modules                                  │
│  ├─ Role-Based Access Control (RBAC)                       │
│  └─ Business Logic (OPD Queue, Load Balancing)             │
└─────────────────────────────────────────────────────────────┘
                            ↕ (Firebase SDK)
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (Firebase Firestore)                  │
│  ├─ 10+ Collections (Users, Hospitals, Doctors, etc.)      │
│  ├─ Real-time Listeners                                    │
│  └─ Automatic Indexing                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

### Backend (`/backend`)

```
backend/
├── app/
│   ├── routes/                    # API endpoints (15 modules)
│   │   ├── auth.py               # Login/Register
│   │   ├── appointments.py       # Appointment booking & OPD token generation
│   │   ├── opd.py                # OPD queue management
│   │   ├── hospital.py           # Hospital operations
│   │   ├── doctors.py            # Doctor management
│   │   ├── patients.py           # Patient profiles
│   │   ├── beds.py               # Bed availability
│   │   ├── pharmacy.py           # Pharmacy operations
│   │   ├── pharmacy_queue.py     # Prescription queue
│   │   ├── admin.py              # Admin operations
│   │   ├── public.py             # Public dashboard data
│   │   └── [8 more modules]
│   ├── models/
│   │   └── schemas.py            # Pydantic models
│   ├── auth_utils.py             # JWT & password hashing
│   ├── firebase.py               # Firebase initialization
│   ├── main.py                   # FastAPI app setup
│   └── database.py               # Database utilities
├── firebase-key.json             # Firebase credentials
├── requirements.txt              # Python dependencies
└── seed_*.py                     # Test data scripts
```

### Frontend (`/frontend/e-hospital-dashboard/src`)

```
src/
├── public/pages/
│   ├── PublicHome.jsx            # Hospital finder, real-time stats
│   └── PublicHomeUpgraded.jsx
├── patient/
│   ├── pages/
│   │   ├── Login.jsx             # Patient login
│   │   ├── Register.jsx          # Patient registration
│   │   ├── OPDBooking.jsx        # Appointment booking
│   │   ├── TokenConfirmation.jsx # Token display
│   │   ├── WaitingTime.jsx       # Real-time waiting time
│   │   ├── MyAppointments.jsx    # Appointment history
│   │   └── [5 more pages]
│   ├── components/
│   │   ├── HospitalSelector.jsx
│   │   ├── PrioritySelector.jsx
│   │   └── ProtectedRoute.jsx
│   └── services/
│       └── patientApi.js         # API calls
├── hospital/
│   ├── pages/
│   │   ├── HospitalLogin.jsx
│   │   ├── HospitalRegister.jsx
│   │   └── HospitalDashboard.jsx # OPD queue, bed management
│   └── components/
│       └── ChangePasswordModal.jsx
├── pharmacy/
│   ├── pages/
│   │   ├── PharmacyLogin.jsx
│   │   └── PharmacyDashboard.jsx # Prescription queue, inventory
│   └── services/
│       └── pharmacyApi.js
├── admin/
│   ├── pages/
│   │   ├── AdminLogin.jsx
│   │   ├── AnalyticsDashboard.jsx
│   │   ├── HospitalsManagement.jsx
│   │   ├── DoctorsManagement.jsx
│   │   ├── BedsManagement.jsx
│   │   └── [5 more pages]
│   ├── components/
│   │   ├── AdminSidebar.jsx
│   │   ├── DoctorLoadTable.jsx
│   │   └── [3 more components]
│   └── services/
│       └── adminApi.js
├── ui/                           # Reusable components
│   ├── StatCard.jsx
│   ├── AlertCard.jsx
│   ├── DashboardLayout.jsx
│   └── [3 more components]
└── api/
    └── api.js                    # Axios instance
```

---

## 🔑 Key Features & How They Work

### 1. **Authentication System**

**Files:** `backend/app/auth_utils.py`, `backend/app/routes/auth.py`

- **JWT Tokens:** 24-hour expiration
- **Password Hashing:** Bcrypt (72-byte limit)
- **Roles:** patient, hospital_admin, pharmacy_admin, doctor, super_admin
- **Protected Routes:** `@require_role()` decorator

```python
# Example: Protected endpoint
@router.get("/hospital-data")
def get_hospital_data(current_user: dict = Depends(require_role(["hospital_admin"]))):
    # Only hospital admins can access
    pass
```

---

### 2. **OPD Queue Management** ⭐ (Core Feature)

**Files:** `backend/app/routes/appointments.py`, `backend/app/routes/opd.py`

#### Flow:
1. **Patient Books Appointment** → `POST /appointments/`
   - Selects hospital, department, doctor
   - Auto-assigns doctor if not selected (load balancing)
   - Creates appointment record

2. **OPD Token Generated** → Automatic
   - Token format: `DDMMNN` (day, month, sequence)
   - Example: `150302` = 15th day, 03rd month, 2nd token

3. **Queue Sorting** → Priority-based
   ```
   Priority Order: Emergency (0) > Elder (1) > Normal (2)
   Within same priority: FIFO (First In, First Out)
   ```

4. **Waiting Time Calculation**
   ```
   Waiting Time = Patients Ahead × 7 minutes (AVG_CONSULT_TIME)
   ```

#### Key Endpoints:
```
POST   /appointments/              # Create appointment
GET    /appointments/by-patient/{id}  # Get patient's appointments
POST   /opd/                       # Add to OPD queue
GET    /opd/waiting-time/{token}   # Get waiting time
PUT    /opd/{token}/status         # Update consultation status
GET    /opd/queue/{hospital_id}    # Get hospital's OPD queue
```

---

### 3. **Load Balancing (Doctor Assignment)**

**Location:** `backend/app/routes/appointments.py` (lines 40-60)

When doctor not selected:
1. Get all available doctors in department
2. Count waiting patients for each doctor (today only)
3. Assign to doctor with minimum load

```python
# Pseudocode
for doctor in available_doctors:
    load = COUNT(opd_queue WHERE doctor_id AND status=waiting AND opd_date=today)
selected_doctor = doctor_with_min_load
```

---

### 4. **Hospital Dashboard**

**Files:** `frontend/src/hospital/pages/HospitalDashboard.jsx`

**Features:**
- Real-time OPD queue display
- Bed availability tracking (Green/Yellow/Red status)
- Doctor workload charts
- Emergency case tracking
- Patient consultation status management

**Data Flow:**
```
Hospital Admin Login → Fetch Hospital ID → 
Get OPD Queue → Display with Priority Sorting → 
Update Consultation Status
```

---

### 5. **Pharmacy Management**

**Files:** `backend/app/routes/pharmacy.py`, `frontend/src/pharmacy/pages/PharmacyDashboard.jsx`

**Features:**
- Prescription queue management
- Medicine inventory tracking
- Low stock alerts (threshold-based)
- Demand analytics

**Collections:**
- `pharmacies` - Pharmacy master data
- `medicines` - Inventory
- `pharmacy_queue` - Prescription queue

---

### 6. **Bed Management**

**Files:** `backend/app/routes/beds.py`

**Status Logic:**
```
Green:  > 30% available
Yellow: 10-30% available
Red:    < 10% available
```

**Endpoint:**
```
GET /beds/{hospital_id}  # Get bed status
PUT /beds/{hospital_id}  # Update bed count
```

---

### 7. **Public Dashboard**

**Files:** `frontend/src/public/pages/PublicHome.jsx`

**Features:**
- Real-time hospital statistics
- Nearby hospital finder (geolocation-based)
- Live bed availability
- OPD waiting times
- Pharmacy stock alerts

---

## 🗄️ Database Collections

### Core Collections:

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| `users` | Authentication | user_id, email, password_hash, role |
| `hospitals` | Hospital master data | hospital_id, name, address, latitude, longitude |
| `departments` | Hospital departments | department_id, hospital_id, name |
| `doctors` | Doctor profiles | doctor_id, hospital_id, department_id, name |
| `patients` | Patient profiles | patient_id, user_id, age, blood_group |
| `appointments` | Appointment bookings | appointment_id, patient_id, doctor_id, status |
| `opd_queue` | Daily OPD queue | token_id, appointment_id, priority, status |
| `beds` | Bed availability | hospital_id, total_beds, available_beds, status |
| `pharmacies` | Pharmacy data | pharmacy_id, hospital_id, admin_user_id |
| `medicines` | Medicine inventory | medicine_id, pharmacy_id, stock_quantity |

---

## 🔐 Security Features

1. **JWT Authentication**
   - Token stored in localStorage (frontend)
   - Sent in Authorization header
   - 24-hour expiration

2. **Password Security**
   - Bcrypt hashing (cost factor: 12)
   - 72-byte limit enforced
   - Never stored in plain text

3. **Role-Based Access Control**
   - `@require_role()` decorator on protected endpoints
   - Roles: patient, hospital_admin, pharmacy_admin, doctor, super_admin

4. **CORS Configuration**
   - Allows frontend (localhost:3000)
   - Credentials disabled for security

---

## 🚀 Running the Application

### Backend Setup:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Backend: http://localhost:8000
API Docs: http://localhost:8000/docs

### Frontend Setup:
```bash
cd frontend/e-hospital-dashboard
npm install
npm start
```
Frontend: http://localhost:3000

### Create Test Data:
```bash
cd backend
python seed_test_users.py
```

---

## 👥 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@test.com | password123 |
| Hospital Admin | hospital@test.com | password123 |
| Pharmacy Admin | pharmacy@test.com | password123 |
| Super Admin | admin@test.com | password123 |

---

## 📊 API Documentation

### Interactive Docs:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Key Endpoints:

#### Authentication
```
POST   /auth/register           # Register new user
POST   /auth/login              # Login & get JWT token
```

#### Appointments & OPD
```
POST   /appointments/           # Book appointment
GET    /appointments/by-patient/{id}  # Get patient appointments
POST   /opd/                    # Add to OPD queue
GET    /opd/waiting-time/{token}     # Get waiting time
GET    /opd/queue/{hospital_id}      # Get hospital OPD queue
PUT    /opd/{token}/status           # Update consultation status
```

#### Hospital Operations
```
GET    /hospitals/              # List all hospitals
POST   /hospitals/              # Create hospital
GET    /beds/{hospital_id}      # Get bed status
PUT    /beds/{hospital_id}      # Update bed count
```

#### Pharmacy
```
GET    /pharmacy/inventory      # Get medicine inventory
PUT    /pharmacy/inventory/{id} # Update stock
GET    /pharmacy/queue          # Get prescription queue
```

---

## 🎨 UI/UX Design

**Color Scheme:**
- Primary: `#0b1f3a` (Dark Blue - Healthcare theme)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)
- Danger: `#ef4444` (Red)

**Responsive Design:**
- Mobile: 320px+
- Tablet: 768px+
- Desktop: 1024px+

**Components:**
- Tailwind CSS for styling
- Recharts for analytics
- Custom loading skeletons
- Status badges with color coding

---

## 🔄 Data Flow Examples

### Example 1: Patient Books OPD Appointment

```
1. Patient selects hospital
   ↓
2. Frontend: GET /departments?hospital_id=X
   ↓
3. Patient selects department
   ↓
4. Frontend: GET /doctors/by-hospital-department?hospital_id=X&department_id=Y
   ↓
5. Patient selects doctor (or auto-assign)
   ↓
6. Frontend: POST /appointments/
   {
     "hospital_id": "h1",
     "department_id": "d1",
     "doctor_id": "doc1",
     "patient_id": "p1",
     "priority": "normal",
     "appointment_date": "2024-01-15"
   }
   ↓
7. Backend:
   - Creates appointment record
   - Auto-assigns doctor if null (load balancing)
   - Generates token (DDMMNN format)
   - Creates OPD queue entry
   ↓
8. Response:
   {
     "appointment_id": "apt123",
     "token_id": "150301",
     "doctor_id": "doc1"
   }
   ↓
9. Frontend displays token confirmation page
```

### Example 2: Hospital Admin Views OPD Queue

```
1. Hospital Admin logs in
   ↓
2. Frontend: POST /auth/login
   ↓
3. Backend returns JWT token
   ↓
4. Frontend: GET /opd/queue/{hospital_id}
   (with Authorization header)
   ↓
5. Backend:
   - Verifies JWT token
   - Checks role (hospital_admin)
   - Fetches OPD queue for today
   - Sorts by priority + FIFO
   ↓
6. Response:
   [
     {
       "token_id": "150301",
       "patient_name": "John Doe",
       "doctor_name": "Dr. Smith",
       "priority": "normal",
       "status": "waiting",
       "patients_ahead": 2
     },
     ...
   ]
   ↓
7. Frontend displays queue with real-time updates
```

---

## 🐛 Common Issues & Solutions

### Issue: "Token not found or consultation completed"
**Cause:** Token status changed to "completed" or token doesn't exist
**Solution:** Refresh page, check if consultation already done

### Issue: "No available doctors"
**Cause:** All doctors unavailable or no doctors in department
**Solution:** Add doctors to department, set availability to "available"

### Issue: CORS errors
**Cause:** Frontend URL not in CORS allowed origins
**Solution:** Check `backend/app/main.py` CORS configuration

### Issue: Firebase connection failed
**Cause:** firebase-key.json missing or invalid
**Solution:** Download credentials from Firebase Console, place in backend/

---

## 📈 Development Status

- ✅ Public Healthcare Dashboard
- ✅ Patient Portal with OPD Booking
- ✅ Hospital Dashboard with Queue Management
- ✅ Pharmacy Dashboard
- ✅ JWT Authentication
- ✅ Load Balancing for Doctor Assignment
- ⏳ Admin Dashboard (In Progress)
- ⏳ Doctor Dashboard (In Progress)

---

## 🤝 Key Technologies

**Backend:**
- FastAPI 0.129.0
- Firebase Admin SDK 6.4.0
- Python-Jose (JWT)
- Passlib + Bcrypt (Password hashing)
- Uvicorn (ASGI server)

**Frontend:**
- React 18
- React Router v6
- Tailwind CSS
- Recharts (Charts)
- Axios (HTTP client)

**Database:**
- Firebase Firestore (NoSQL)
- Real-time listeners
- Automatic indexing

---

## 📞 Support & Documentation

- **README.md** - Setup instructions
- **DATABASE_DESIGN.md** - Database schema details
- **TROUBLESHOOTING.md** - Common issues
- **API Docs:** http://localhost:8000/docs

---

**Built with ❤️ for better healthcare management**
