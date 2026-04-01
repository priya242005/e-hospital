# 🏥 Hospital Admin Setup - Quick Reference

## 📋 3-Step Process

### Step 1️⃣: Get Hospital IDs
```bash
curl http://localhost:8000/hospitals
```
Copy the `hospital_id` values

---

### Step 2️⃣: Create Admin Credentials
For each hospital, run:

```bash
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "PASTE_HOSPITAL_ID_HERE",
    "email": "admin@hospitalname.com",
    "password": "SecurePassword@123",
    "name": "Hospital Name Admin"
  }'
```

---

### Step 3️⃣: Login & Add Bed Data
1. Go to: `http://localhost:3000/admin/login`
2. Select hospital
3. Enter email & password
4. Click "Login as Admin"
5. Click "+ Add Bed Data"
6. Enter bed counts
7. Click "Add Bed Data"

---

## 📝 Example Setup

### Hospital 1: City Hospital
```bash
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "abc123",
    "email": "admin@cityhospital.com",
    "password": "CityHospital@123",
    "name": "City Hospital Admin"
  }'
```

**Login Credentials:**
- Email: `admin@cityhospital.com`
- Password: `CityHospital@123`

---

### Hospital 2: Central Medical
```bash
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "xyz789",
    "email": "admin@centralmedical.com",
    "password": "CentralMedical@123",
    "name": "Central Medical Admin"
  }'
```

**Login Credentials:**
- Email: `admin@centralmedical.com`
- Password: `CentralMedical@123`

---

### Hospital 3: Green Cross
```bash
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "pqr456",
    "email": "admin@greencross.com",
    "password": "GreenCross@123",
    "name": "Green Cross Admin"
  }'
```

**Login Credentials:**
- Email: `admin@greencross.com`
- Password: `GreenCross@123`

---

## ✅ Verify Setup

Check if admins created:
```bash
curl http://localhost:8000/auth/hospital-admins/abc123
```

---

## 🔑 Login Flow

```
1. Home Page (http://localhost:3000)
   ↓
2. Click "Admin Portal" (red button)
   ↓
3. Select Hospital from Dropdown
   ↓
4. Enter Email & Password
   ↓
5. Click "Login as Admin"
   ↓
6. Bed Management Dashboard
   ↓
7. Click "+ Add Bed Data"
   ↓
8. Enter Bed Counts & Submit
```

---

## 📊 Bed Data Entry

**General Beds**: Regular ward beds (50-100)
**ICU Beds**: Intensive care beds (10-30)
**Emergency Beds**: Emergency department beds (5-15)

Example:
- General: 50
- ICU: 20
- Emergency: 10

---

## 🔒 Security Tips

✅ Use strong passwords
✅ Store credentials securely
✅ Don't share via email
✅ Change password after first login
✅ Use unique email for each admin

---

## 🚀 Automation Script

Save as `create_all_admins.py`:

```python
import requests

hospitals = [
    ("abc123", "City Hospital", "admin@cityhospital.com", "CityHospital@123"),
    ("xyz789", "Central Medical", "admin@centralmedical.com", "CentralMedical@123"),
    ("pqr456", "Green Cross", "admin@greencross.com", "GreenCross@123"),
]

for hospital_id, name, email, password in hospitals:
    payload = {
        "hospital_id": hospital_id,
        "email": email,
        "password": password,
        "name": f"{name} Admin"
    }
    
    response = requests.post(
        'http://localhost:8000/auth/create-hospital-admin',
        json=payload
    )
    
    if response.status_code == 200:
        print(f"✅ {name}: {email}")
    else:
        print(f"❌ {name}: {response.text}")
```

Run: `python create_all_admins.py`

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Hospital not found | Check hospital_id is correct |
| Email already registered | Use different email |
| Connection refused | Start backend server |
| Login fails | Verify email & password |
| Can't see hospital in dropdown | Refresh page or clear cache |

---

## 📱 Next Steps

After creating credentials:
1. ✅ Create admin credentials
2. ✅ Login to admin portal
3. ✅ Add bed data for hospital
4. ✅ Verify bed data appears on patient side
5. ✅ Test OPD booking with bed availability

---

**Ready to go!** 🚀
