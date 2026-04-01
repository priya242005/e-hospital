# 🎯 Complete Hospital Admin Setup - Step by Step Example

## 📌 Scenario
You have 3 hospitals and want to create admin credentials for each, then add bed data.

---

## 🔍 Step 1: Get Hospital Information

### Command:
```bash
curl http://localhost:8000/hospitals
```

### Expected Response:
```json
[
  {
    "hospital_id": "550e8400-e29b-41d4-a716-446655440000",
    "hospital_name": "City Hospital",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "contact_number": "555-0001",
    "email": "info@cityhospital.com"
  },
  {
    "hospital_id": "550e8400-e29b-41d4-a716-446655440001",
    "hospital_name": "Central Medical Center",
    "address": "456 Oak Ave",
    "city": "Boston",
    "state": "MA",
    "contact_number": "555-0002",
    "email": "info@centralmedical.com"
  },
  {
    "hospital_id": "550e8400-e29b-41d4-a716-446655440002",
    "hospital_name": "Green Cross Hospital",
    "address": "789 Pine Rd",
    "city": "Chicago",
    "state": "IL",
    "contact_number": "555-0003",
    "email": "info@greencross.com"
  }
]
```

### Save These IDs:
```
Hospital 1 ID: 550e8400-e29b-41d4-a716-446655440000
Hospital 2 ID: 550e8400-e29b-41d4-a716-446655440001
Hospital 3 ID: 550e8400-e29b-41d4-a716-446655440002
```

---

## 🔐 Step 2: Create Admin Credentials

### For Hospital 1 (City Hospital):

```bash
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@cityhospital.com",
    "password": "CityHospital@2024",
    "name": "City Hospital Admin"
  }'
```

**Response:**
```json
{
  "message": "Hospital admin created successfully",
  "user_id": "user-001",
  "email": "admin@cityhospital.com",
  "hospital_id": "550e8400-e29b-41d4-a716-446655440000",
  "hospital_name": "City Hospital"
}
```

✅ **Save Credentials:**
- Email: `admin@cityhospital.com`
- Password: `CityHospital@2024`

---

### For Hospital 2 (Central Medical Center):

```bash
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "admin@centralmedical.com",
    "password": "CentralMedical@2024",
    "name": "Central Medical Admin"
  }'
```

**Response:**
```json
{
  "message": "Hospital admin created successfully",
  "user_id": "user-002",
  "email": "admin@centralmedical.com",
  "hospital_id": "550e8400-e29b-41d4-a716-446655440001",
  "hospital_name": "Central Medical Center"
}
```

✅ **Save Credentials:**
- Email: `admin@centralmedical.com`
- Password: `CentralMedical@2024`

---

### For Hospital 3 (Green Cross Hospital):

```bash
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "550e8400-e29b-41d4-a716-446655440002",
    "email": "admin@greencross.com",
    "password": "GreenCross@2024",
    "name": "Green Cross Admin"
  }'
```

**Response:**
```json
{
  "message": "Hospital admin created successfully",
  "user_id": "user-003",
  "email": "admin@greencross.com",
  "hospital_id": "550e8400-e29b-41d4-a716-446655440002",
  "hospital_name": "Green Cross Hospital"
}
```

✅ **Save Credentials:**
- Email: `admin@greencross.com`
- Password: `GreenCross@2024`

---

## 📋 Credentials Summary Table

| Hospital | Email | Password | Hospital ID |
|----------|-------|----------|-------------|
| City Hospital | admin@cityhospital.com | CityHospital@2024 | 550e8400-e29b-41d4-a716-446655440000 |
| Central Medical | admin@centralmedical.com | CentralMedical@2024 | 550e8400-e29b-41d4-a716-446655440001 |
| Green Cross | admin@greencross.com | GreenCross@2024 | 550e8400-e29b-41d4-a716-446655440002 |

---

## ✅ Step 3: Verify Admins Created

### Check Hospital 1 Admins:
```bash
curl http://localhost:8000/auth/hospital-admins/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
[
  {
    "user_id": "user-001",
    "name": "City Hospital Admin",
    "email": "admin@cityhospital.com",
    "role": "hospital_admin",
    "hospital_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T10:30:00"
  }
]
```

✅ Admin created successfully!

---

## 🌐 Step 4: Login to Admin Portal

### Open Browser:
Navigate to: `http://localhost:3000/admin/login`

### Screen 1: Admin Login Page
```
┌─────────────────────────────────────┐
│   Smart e-Hospital                  │
│   Hospital Admin Portal              │
├─────────────────────────────────────┤
│                                     │
│  Select Hospital: [Dropdown ▼]      │
│  Email: [________________]           │
│  Password: [________________]        │
│                                     │
│  [Login as Admin]                   │
│                                     │
└─────────────────────────────────────┘
```

### Fill Form for City Hospital:
1. **Select Hospital**: Click dropdown → Select "City Hospital"
2. **Email**: `admin@cityhospital.com`
3. **Password**: `CityHospital@2024`
4. **Click**: "Login as Admin"

### Expected Result:
✅ Redirected to Bed Management Dashboard

---

## 🛏️ Step 5: Add Bed Data

### Screen 2: Bed Management Dashboard
```
┌─────────────────────────────────────┐
│  Bed Management                     │
│  [+ Add Bed Data]                   │
├─────────────────────────────────────┤
│                                     │
│  Total Hospitals: 0                 │
│  General Beds: 0                    │
│  ICU Beds: 0                        │
│  Emergency Beds: 0                  │
│                                     │
│  No bed data available              │
│  [+ Add First Bed Data]             │
│                                     │
└─────────────────────────────────────┘
```

### Click "+ Add Bed Data":
```
┌─────────────────────────────────────┐
│  Add New Bed Data                   │
├─────────────────────────────────────┤
│                                     │
│  Select Hospital: [City Hospital ▼] │
│  General Beds: [50]                 │
│  ICU Beds: [20]                     │
│  Emergency Beds: [10]               │
│                                     │
│  [Add Bed Data]  [Cancel]           │
│                                     │
└─────────────────────────────────────┘
```

### Enter Bed Data:
- **Hospital**: City Hospital (auto-selected)
- **General Beds**: 50
- **ICU Beds**: 20
- **Emergency Beds**: 10

### Click "Add Bed Data":
✅ Success message appears!

### Updated Dashboard:
```
┌─────────────────────────────────────┐
│  Bed Management                     │
│  [+ Add Bed Data]                   │
├─────────────────────────────────────┤
│                                     │
│  Total Hospitals: 1                 │
│  General Beds: 50                   │
│  ICU Beds: 20                       │
│  Emergency Beds: 10                 │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ City Hospital                   ││
│  │ 🛏️ General: 50                  ││
│  │ 🏥 ICU: 20                      ││
│  │ 🚨 Emergency: 10                ││
│  │ Total: 80                       ││
│  │ [✏️ Edit]                       ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

## 🔄 Step 6: Repeat for Other Hospitals

### Logout & Login as Hospital 2:
1. Logout (if logout button available)
2. Go to: `http://localhost:3000/admin/login`
3. Select: "Central Medical Center"
4. Email: `admin@centralmedical.com`
5. Password: `CentralMedical@2024`
6. Add bed data:
   - General: 60
   - ICU: 25
   - Emergency: 15

### Logout & Login as Hospital 3:
1. Go to: `http://localhost:3000/admin/login`
2. Select: "Green Cross Hospital"
3. Email: `admin@greencross.com`
4. Password: `GreenCross@2024`
5. Add bed data:
   - General: 45
   - ICU: 18
   - Emergency: 8

---

## 📊 Step 7: Verify on Patient Side

### Open Patient Portal:
Navigate to: `http://localhost:3000`

### Click "Book OPD Appointment":
1. Login as patient (or register)
2. Click "Book OPD"
3. Select hospital: "City Hospital"
4. You should see bed availability:
   - General: 50
   - ICU: 20
   - Emergency: 10

✅ Bed data is now visible to patients!

---

## 📱 Step 8: Check Public Dashboard

### Open Public Home:
Navigate to: `http://localhost:3000`

### Scroll to "Bed Availability Overview":
```
┌──────────────────────────────────────┐
│  Bed Availability Overview           │
├──────────────────────────────────────┤
│                                      │
│  Available General Beds: 155         │
│  Available ICU Beds: 63              │
│  Available Emergency Beds: 33        │
│                                      │
└──────────────────────────────────────┘
```

✅ Total beds from all hospitals: 155 + 63 + 33 = 251 beds

---

## 🎉 Complete!

You have successfully:
1. ✅ Created admin credentials for 3 hospitals
2. ✅ Logged in to admin portal
3. ✅ Added bed data for each hospital
4. ✅ Verified data on patient side
5. ✅ Verified data on public dashboard

---

## 📝 Credentials Reference

**Keep this safe!**

```
HOSPITAL ADMIN CREDENTIALS
==========================

Hospital 1: City Hospital
Email: admin@cityhospital.com
Password: CityHospital@2024

Hospital 2: Central Medical Center
Email: admin@centralmedical.com
Password: CentralMedical@2024

Hospital 3: Green Cross Hospital
Email: admin@greencross.com
Password: GreenCross@2024
```

---

## 🚀 Next Steps

1. Share credentials with hospital staff
2. Ask them to change password on first login
3. Monitor bed data updates
4. Update bed data as occupancy changes
5. Track patient bookings

---

**Setup Complete!** 🎊
