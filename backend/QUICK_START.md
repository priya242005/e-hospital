# 🏥 Quick Setup Guide - Hospital Admin Credentials

## ⚡ Quick Start (5 minutes)

### Step 1: Run Setup Script
```bash
cd backend
python setup_all.py
```

This will automatically:
- ✅ Create hospital admin credentials
- ✅ Create departments
- ✅ Create sample doctors
- ✅ Create sample beds

### Step 2: Check Credentials
```bash
cat HOSPITAL_ADMIN_CREDENTIALS.txt
```

You'll see something like:
```
Hospital: City Hospital
Email: admin.city_hospital@hospital.com
Password: Hospital@1123
Hospital ID: hospital_id_123
```

### Step 3: Login
1. Go to `http://localhost:3000/admin/login`
2. Enter email and password
3. Click "Login"
4. You're in your hospital dashboard!

---

## 📋 Individual Scripts

If you want to run scripts individually:

### Create Hospital Admin Credentials Only
```bash
python seed_hospital_credentials.py
```

### Create Departments Only
```bash
python seed_departments.py
```

### Create Doctors Only
```bash
python seed_doctors.py
```

### Create Beds Only
```bash
python seed_beds.py
```

---

## 🔑 Login Credentials Format

### Hospital Admin
- **Email**: `admin.hospital_name@hospital.com`
- **Password**: `Hospital@1123` (where 1 is the hospital number)
- **Role**: Hospital Admin
- **Access**: Hospital Dashboard

### Super Admin
- **Email**: `admin@test.com`
- **Password**: `password123`
- **Role**: Super Admin
- **Access**: Admin Analytics Dashboard

---

## 📊 What Gets Created

### Departments (10 per hospital)
- General Medicine
- Cardiology
- Orthopedics
- Pediatrics
- Neurology
- Dermatology
- ENT
- Ophthalmology
- Psychiatry
- Surgery

### Doctors (5+ per hospital)
- Dr. Rajesh Kumar (Cardiologist)
- Dr. Priya Singh (Pediatrician)
- Dr. Amit Patel (Orthopedic Surgeon)
- Dr. Neha Sharma (Neurologist)
- Dr. Vikram Desai (General Surgeon)

### Beds (26 per hospital)
- **General Ward**: 3 wards × 10 beds = 30 beds
- **ICU Ward**: 1 ward × 5 beds = 5 beds
- **Emergency Ward**: 1 ward × 8 beds = 8 beds
- **Total**: 43 beds per hospital

---

## 🎯 Hospital Dashboard Features

After login, you can:

### 📊 Dashboard Tab
- View hospital overview
- See today's OPD patients
- Monitor active doctors
- Check available beds
- View emergency cases
- Monitor waiting times

### 📋 Appointments Tab
- View OPD queue
- See patient details
- Mark consultations as complete

### ➕ Book Appointment Tab
- Register walk-in patients
- Assign doctors
- Set priority levels

### 🏢 Departments Tab
- View all departments
- Add new departments
- Delete departments

### 👨⚕️ Doctors Tab
- View all doctors
- Add new doctors
- Monitor doctor availability

### 🛏️ Beds Tab
- View all beds by type
- Filter by bed type
- Assign beds to patients
- Track bed status

### 🔴 Beds Occupied Tab
- View occupied beds
- See patient assignments
- Release beds

### 👥 Patients Tab
- View all patients in queue
- See patient details
- Delete patient records

### 💊 Pharmacy Tab
- View pharmacy status
- Monitor prescriptions

### 👥 Pharmacy Staff Tab
- Manage pharmacy staff
- Create staff accounts

### 🔔 Alerts Tab
- View system alerts
- Monitor bed shortage
- Check emergency load

---

## 🔐 Security Notes

⚠️ **Important:**
1. Keep `HOSPITAL_ADMIN_CREDENTIALS.txt` secure
2. Don't share credentials via email
3. Change passwords after first login
4. Use strong passwords in production
5. Enable 2FA if available

---

## 🐛 Troubleshooting

### "No hospitals found"
→ Create hospitals first in admin dashboard

### "Firebase credentials not found"
→ Ensure `e-hospital-firebase-key.json` is in backend folder

### "Login failed"
→ Check credentials file for correct email/password

### "Admin already exists"
→ This is normal - script skips existing admins

### "Departments not showing"
→ Run `seed_departments.py` first

---

## 📁 Files Created

```
backend/
├── HOSPITAL_ADMIN_CREDENTIALS.txt    ← Hospital login credentials
├── HOSPITAL_ADMIN_CREDENTIALS.json   ← Machine-readable format
├── HOSPITAL_SETUP_GUIDE.md           ← Detailed setup guide
├── seed_hospital_credentials.py      ← Create admin accounts
├── seed_departments.py               ← Create departments
├── seed_doctors.py                   ← Create doctors
├── seed_beds.py                      ← Create beds
└── setup_all.py                      ← Master setup script
```

---

## 🚀 Next Steps

1. ✅ Run `python setup_all.py`
2. ✅ Check credentials file
3. ✅ Start backend: `uvicorn app.main:app --reload`
4. ✅ Start frontend: `npm start`
5. ✅ Login at `http://localhost:3000/admin/login`
6. ✅ Explore hospital dashboard

---

## 📞 Support

For issues:
1. Check HOSPITAL_SETUP_GUIDE.md
2. Review Firebase console
3. Check backend logs
4. Verify network connectivity

---

**Version**: 1.0  
**Last Updated**: 2024
