# Troubleshooting Guide

## Issue: 401 Unauthorized on Login

### Cause
User doesn't exist in database or password doesn't match.

### Solution

#### Option 1: Create Test Users (Recommended)
Run the seeding script:
```bash
cd backend
python seed_test_users.py
```

This creates test users:
- **Patient**: patient@test.com / password123
- **Hospital Admin**: hospital@test.com / password123
- **Pharmacy Admin**: pharmacy@test.com / password123
- **Super Admin**: admin@test.com / password123

#### Option 2: Register New User
1. Go to registration page
2. Fill in details
3. Use the credentials to login

#### Option 3: Check Existing User
If you already registered, make sure:
- Email is correct (case-sensitive)
- Password is correct
- User role matches the login portal (hospital_admin for hospital login)

---

## Issue: Firestore Query Warning

### Cause
Firestore updated to require `filter` keyword argument.

### Solution
Already fixed in `public.py`. If you see warnings elsewhere, update queries from:
```python
.where("field", "==", "value")
```
To:
```python
.where(filter=FieldFilter("field", "==", "value"))
```

And add import:
```python
from google.cloud.firestore_v1.base_query import FieldFilter
```

---

## Issue: Hospital Dashboard Shows "No Hospital Found"

### Cause
Hospital admin user is not linked to a hospital.

### Solution
1. Register a new hospital admin via `/hospital/register`
2. This automatically creates and links a hospital
3. Login with those credentials

OR manually link existing user:
1. Get user_id from Firestore users collection
2. Update hospital document with `created_by: user_id`

---

## Issue: Charts Not Displaying

### Cause
Recharts library not installed.

### Solution
```bash
cd frontend/e-hospital-dashboard
npm install recharts
```

---

## Issue: CORS Error

### Cause
Backend CORS not configured for frontend origin.

### Solution
Already configured in `main.py` with `allow_origins=["*"]`.
If still having issues, restart backend server.

---

## Issue: Module Not Found Errors

### Backend
```bash
cd backend
pip install -r requirements.txt
```

Or install individually:
```bash
pip install fastapi uvicorn firebase-admin python-jose passlib bcrypt
```

### Frontend
```bash
cd frontend/e-hospital-dashboard
npm install
```

---

## Testing Checklist

### Backend
- [ ] FastAPI server running on http://localhost:8000
- [ ] Swagger docs accessible at http://localhost:8000/docs
- [ ] Firebase credentials configured
- [ ] Test users created

### Frontend
- [ ] React dev server running on http://localhost:3000
- [ ] Recharts installed
- [ ] Can access public dashboard without login
- [ ] Can login with test credentials
- [ ] Charts render correctly

---

## Quick Start Commands

### Backend
```bash
cd backend
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend/e-hospital-dashboard
npm start
```

### Create Test Data
```bash
cd backend
python seed_test_users.py
```
