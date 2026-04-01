# Hospital Admin Login & Password Change - Quick Reference

## 🚀 Quick Start

### Step 1: Create Admin Account
```bash
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "hospital-id",
    "email": "admin@hospital.com",
    "password": "DefaultPassword123",
    "name": "Admin Name"
  }'
```

### Step 2: Login
- URL: `http://localhost:3000/hospital/login`
- Email: `admin@hospital.com`
- Password: `DefaultPassword123`

### Step 3: Change Password
1. Click **"🔐 Change Password"** button in dashboard header
2. Enter current password
3. Enter new password (min 6 characters)
4. Confirm new password
5. Click **"Change Password"**
6. Auto-logout and login with new password

---

## 📋 Default Credentials Format

| Field | Value |
|-------|-------|
| Email | admin@hospital.com |
| Password | DefaultPassword123 |
| Role | hospital_admin |
| Hospital ID | hospital-id |

---

## 🔐 Password Requirements

✅ Minimum 6 characters
✅ Must be different from old password
✅ Case-sensitive
✅ Can include special characters

---

## 🛠️ Backend Endpoints

### Create Hospital Admin
```
POST /auth/create-hospital-admin
```

### Change Password
```
POST /auth/change-password
Headers: Authorization: Bearer <token>
```

### Get Hospital Admins
```
GET /auth/hospital-admins/{hospital_id}
```

---

## 🎯 Frontend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| ChangePasswordModal | `src/hospital/components/ChangePasswordModal.jsx` | Modal for password change |
| HospitalDashboard | `src/hospital/pages/HospitalDashboard.jsx` | Dashboard with change password button |
| HospitalLogin | `src/hospital/pages/HospitalLogin.jsx` | Login page |

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "Old password is incorrect" | Verify current password (case-sensitive) |
| "New password must be at least 6 characters" | Use password with 6+ characters |
| "New password must be different" | Choose different password |
| Change password button not visible | Ensure logged in as hospital_admin |

---

## 📊 Database Schema

```
users collection:
{
  user_id: string (auto)
  name: string
  email: string (unique)
  password: string (bcrypt hashed)
  role: "hospital_admin"
  hospital_id: string
  created_at: timestamp
  updated_at: timestamp
}
```

---

## 🔄 Complete Flow

```
Create Admin → Login → Change Password → Re-login → Access Dashboard
```

---

## 📝 Example Workflow

```bash
# 1. Create admin
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "hosp-001",
    "email": "admin@hospital.com",
    "password": "Temp123",
    "name": "Admin"
  }'

# 2. Login (in frontend)
# Navigate to http://localhost:3000/hospital/login
# Enter: admin@hospital.com / Temp123

# 3. Change password (in frontend)
# Click "🔐 Change Password"
# Old: Temp123
# New: SecurePassword456
# Confirm: SecurePassword456

# 4. Re-login with new password
# admin@hospital.com / SecurePassword456
```

---

## 🔒 Security Checklist

- [ ] Default password changed after first login
- [ ] New password is strong (6+ chars, mixed case, numbers)
- [ ] Password not shared with anyone
- [ ] Logout when leaving workstation
- [ ] Regular password updates (monthly recommended)

---

**Version**: 1.0 | **Last Updated**: 2024
