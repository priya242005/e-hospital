# 🔐 How to Create Hospital Admin Login Credentials

## Method 1: Using API (Recommended)

### Step 1: Get Hospital ID
First, you need the hospital ID. Get all hospitals:

```bash
curl http://localhost:8000/hospitals
```

Response will show:
```json
[
  {
    "hospital_id": "abc123def456",
    "hospital_name": "City Hospital",
    "city": "New York",
    ...
  },
  {
    "hospital_id": "xyz789uvw012",
    "hospital_name": "Central Medical",
    "city": "Boston",
    ...
  }
]
```

### Step 2: Create Admin Credentials

Use the API endpoint to create admin for each hospital:

```bash
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "abc123def456",
    "email": "admin@cityhospital.com",
    "password": "CityHospital@123",
    "name": "City Hospital Admin"
  }'
```

Response:
```json
{
  "message": "Hospital admin created successfully",
  "user_id": "user-id-123",
  "email": "admin@cityhospital.com",
  "hospital_id": "abc123def456",
  "hospital_name": "City Hospital"
}
```

### Step 3: Repeat for Each Hospital

Create credentials for all hospitals:

```bash
# Hospital 1
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "abc123def456",
    "email": "admin@cityhospital.com",
    "password": "CityHospital@123",
    "name": "City Hospital Admin"
  }'

# Hospital 2
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "xyz789uvw012",
    "email": "admin@centralmedical.com",
    "password": "CentralMedical@123",
    "name": "Central Medical Admin"
  }'

# Hospital 3
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "pqr456stu789",
    "email": "admin@greencross.com",
    "password": "GreenCross@123",
    "name": "Green Cross Admin"
  }'
```

---

## Method 2: Using Python Script

### Step 1: Create Script

Create file: `backend/create_admin_credentials.py`

```python
import requests
import json

# Get all hospitals
hospitals_response = requests.get('http://localhost:8000/hospitals')
hospitals = hospitals_response.json()

print(f"Found {len(hospitals)} hospitals\n")

# Create admin for each hospital
for idx, hospital in enumerate(hospitals, 1):
    hospital_id = hospital['hospital_id']
    hospital_name = hospital['hospital_name']
    
    # Generate credentials
    email = f"admin.{hospital_name.lower().replace(' ', '_')}@hospital.com"
    password = f"Hospital@{idx}123"
    
    # Create admin
    payload = {
        "hospital_id": hospital_id,
        "email": email,
        "password": password,
        "name": f"{hospital_name} Admin"
    }
    
    response = requests.post(
        'http://localhost:8000/auth/create-hospital-admin',
        json=payload
    )
    
    if response.status_code == 200:
        print(f"✅ Created admin for: {hospital_name}")
        print(f"   Email: {email}")
        print(f"   Password: {password}\n")
    else:
        print(f"❌ Failed for {hospital_name}: {response.text}\n")

print("✅ All admins created!")
```

### Step 2: Run Script

```bash
cd backend
python create_admin_credentials.py
```

---

## Method 3: Using Postman

### Step 1: Open Postman

### Step 2: Create New Request
- Method: POST
- URL: `http://localhost:8000/auth/create-hospital-admin`

### Step 3: Set Headers
```
Content-Type: application/json
```

### Step 4: Set Body (JSON)
```json
{
  "hospital_id": "abc123def456",
  "email": "admin@cityhospital.com",
  "password": "CityHospital@123",
  "name": "City Hospital Admin"
}
```

### Step 5: Click Send

---

## Example Credentials for Testing

Here are example credentials you can use:

### Hospital 1: City Hospital
- **Email**: admin.city_hospital@hospital.com
- **Password**: Hospital@1123
- **Hospital ID**: (get from /hospitals endpoint)

### Hospital 2: Central Medical
- **Email**: admin.central_medical@hospital.com
- **Password**: Hospital@2123
- **Hospital ID**: (get from /hospitals endpoint)

### Hospital 3: Green Cross
- **Email**: admin.green_cross@hospital.com
- **Password**: Hospital@3123
- **Hospital ID**: (get from /hospitals endpoint)

---

## 🔑 Login with Created Credentials

### Step 1: Go to Admin Login
Navigate to: `http://localhost:3000/admin/login`

### Step 2: Select Hospital
- Click dropdown
- Select hospital name

### Step 3: Enter Credentials
- Email: `admin@cityhospital.com`
- Password: `CityHospital@123`

### Step 4: Click Login
- You'll be redirected to bed management page

### Step 5: Add Bed Data
- Click "+ Add Bed Data"
- Enter bed counts:
  - General Beds: 50
  - ICU Beds: 20
  - Emergency Beds: 10
- Click "Add Bed Data"

---

## ✅ Verify Credentials Created

Check if admins were created:

```bash
curl http://localhost:8000/auth/hospital-admins/{hospital_id}
```

Replace `{hospital_id}` with actual hospital ID.

Response:
```json
[
  {
    "user_id": "user-123",
    "name": "City Hospital Admin",
    "email": "admin@cityhospital.com",
    "role": "hospital_admin",
    "hospital_id": "abc123def456",
    "created_at": "2024-01-15T10:30:00"
  }
]
```

---

## 🔒 Password Requirements

Recommended password format:
- **Length**: Minimum 8 characters
- **Format**: `HospitalName@123`
- **Example**: `CityHospital@123`

---

## 📋 Credential Management

### Store Credentials Securely
1. Save credentials in secure location
2. Share with hospital staff via secure channel
3. Ask staff to change password on first login
4. Never share via email or chat

### Update Credentials
If you need to change password:
1. Create new admin with different email
2. Delete old admin (if needed)
3. Share new credentials

### Delete Admin
```bash
# Get user ID from hospital-admins endpoint
# Then delete from Firebase Console or via API
```

---

## 🚀 Quick Setup for Multiple Hospitals

### Using cURL Loop (Linux/Mac)

```bash
#!/bin/bash

# Array of hospitals
hospitals=(
  "abc123:City Hospital:CityHospital@123"
  "xyz789:Central Medical:CentralMedical@123"
  "pqr456:Green Cross:GreenCross@123"
)

for hospital in "${hospitals[@]}"; do
  IFS=':' read -r id name pass <<< "$hospital"
  email="admin.${name// /_}@hospital.com"
  
  curl -X POST http://localhost:8000/auth/create-hospital-admin \
    -H "Content-Type: application/json" \
    -d "{
      \"hospital_id\": \"$id\",
      \"email\": \"$email\",
      \"password\": \"$pass\",
      \"name\": \"$name Admin\"
    }"
  
  echo "Created admin for $name"
done
```

---

## 🐛 Troubleshooting

### Error: "Hospital not found"
- Check hospital_id is correct
- Verify hospital exists in database

### Error: "Email already registered"
- Email is already used
- Use different email address

### Error: "Connection refused"
- Backend server not running
- Start backend: `uvicorn app.main:app --reload`

### Can't login after creating credentials
- Verify email and password are correct
- Check hospital is selected in dropdown
- Clear browser cache and try again

---

## 📞 Support

For issues:
1. Check backend logs
2. Verify Firebase connection
3. Ensure all hospitals are created first
4. Check email format is valid

---

**Last Updated**: 2024
**Version**: 1.0
