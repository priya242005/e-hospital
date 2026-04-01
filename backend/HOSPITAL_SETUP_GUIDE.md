# Hospital Admin Credentials Setup Guide

## Overview
This guide explains how to create login credentials for hospital admins and seed initial data for each hospital.

## Prerequisites
- Python 3.8+
- Firebase credentials file (`e-hospital-firebase-key.json`)
- Hospitals already created in the database
- Backend dependencies installed

## Step 1: Create Hospital Admin Credentials

### Run the Seeding Script
```bash
cd backend
python seed_hospital_credentials.py
```

### What This Script Does
1. ✅ Fetches all existing hospitals from the database
2. ✅ Creates a unique admin account for each hospital
3. ✅ Generates secure passwords
4. ✅ Saves credentials to two files:
   - `HOSPITAL_ADMIN_CREDENTIALS.txt` (human-readable)
   - `HOSPITAL_ADMIN_CREDENTIALS.json` (machine-readable)

### Generated Credentials Format
```
Hospital: City Hospital
Email: admin.city_hospital@hospital.com
Password: Hospital@1123
Hospital ID: hospital_id_123
```

## Step 2: Login to Hospital Dashboard

### For Hospital Admins
1. Go to `http://localhost:3000/admin/login`
2. Enter your hospital admin email
3. Enter your password
4. Click "Login"
5. You'll be redirected to your hospital dashboard

### For Super Admins
1. Go to `http://localhost:3000/admin/login`
2. Enter super admin credentials
3. Click "Login"
4. You'll be redirected to the admin analytics dashboard

## Step 3: Seed Hospital Data (Departments, Doctors, Beds)

### Option A: Using Hospital Dashboard
1. Login as hospital admin
2. Go to "Departments" tab → Add departments
3. Go to "Doctors" tab → Add doctors
4. Go to "Beds" tab → Add beds

### Option B: Using Seed Scripts (Recommended for bulk data)

#### Create Departments
```bash
python seed_departments.py
```

#### Create Doctors
```bash
python seed_doctors.py
```

#### Create Beds
```bash
python seed_beds.py
```

## File Structure

```
backend/
├── seed_hospital_credentials.py      # Create hospital admin accounts
├── seed_departments.py               # Create departments for hospitals
├── seed_doctors.py                   # Create doctors for hospitals
├── seed_beds.py                      # Create beds for hospitals
├── HOSPITAL_ADMIN_CREDENTIALS.txt    # Generated credentials (text)
└── HOSPITAL_ADMIN_CREDENTIALS.json   # Generated credentials (JSON)
```

## Database Collections

### Users Collection
```json
{
  "name": "Hospital Name Admin",
  "email": "admin.hospital_name@hospital.com",
  "phone": "contact_number",
  "role": "hospital_admin",
  "password": "hashed_password",
  "hospital_id": "hospital_id_123",
  "status": "active",
  "created_at": "2024-01-01T00:00:00"
}
```

### Hospitals Collection
```json
{
  "hospital_id": "hospital_id_123",
  "hospital_name": "City Hospital",
  "address": "123 Main St",
  "city": "New York",
  "contact_number": "555-1234",
  "email": "info@cityhospital.com",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

## Troubleshooting

### Issue: "No hospitals found in database"
**Solution:** Create hospitals first using the admin dashboard or seed script

### Issue: "Firebase credentials file not found"
**Solution:** Ensure `e-hospital-firebase-key.json` is in the backend directory

### Issue: "Admin already exists for this hospital"
**Solution:** This is normal - the script skips hospitals that already have admins

### Issue: "Login failed - credentials not working"
**Solution:** 
1. Check the credentials file for correct email/password
2. Ensure the user role is set to "hospital_admin"
3. Verify the hospital_id is correct

## Security Notes

⚠️ **Important:**
- Keep `HOSPITAL_ADMIN_CREDENTIALS.txt` secure
- Don't commit credentials files to version control
- Change default passwords after first login
- Use strong, unique passwords for production
- Implement password reset functionality

## API Endpoints

### Login
```
POST /auth/login
{
  "email": "admin.hospital_name@hospital.com",
  "password": "Hospital@1123"
}
```

### Get Hospital by User
```
GET /hospitals/by-user/{user_id}
Headers: Authorization: Bearer {token}
```

### Get Hospital Dashboard
```
GET /hospitals/{hospital_id}/dashboard
Headers: Authorization: Bearer {token}
```

## Next Steps

1. ✅ Run `seed_hospital_credentials.py`
2. ✅ Login with generated credentials
3. ✅ Add departments, doctors, and beds
4. ✅ Configure hospital settings
5. ✅ Invite staff members

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase console for data
3. Check backend logs for errors
4. Verify network connectivity

---

**Last Updated:** 2024
**Version:** 1.0
