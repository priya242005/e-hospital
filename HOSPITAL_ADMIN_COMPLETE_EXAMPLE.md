# Hospital Admin Login & Password Change - Complete Example

## 📌 Scenario

You have a hospital registered in the system and need to:
1. Create admin credentials for the hospital
2. Login with default credentials
3. Change password to a new secure password
4. Re-login with new password

---

## 🏥 Sample Hospital Data

Assuming you have a hospital with these details:

```json
{
  "hospital_id": "hosp-001",
  "hospital_name": "City Medical Center",
  "address": "123 Main Street, City",
  "phone": "555-0100",
  "email": "info@citymedical.com"
}
```

---

## Step 1️⃣: Create Hospital Admin Account

### Using cURL

```bash
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "hosp-001",
    "email": "admin@citymedical.com",
    "password": "TempPassword123",
    "name": "John Admin"
  }'
```

### Expected Response

```json
{
  "message": "Hospital admin created successfully",
  "user_id": "admin-user-001",
  "email": "admin@citymedical.com",
  "hospital_id": "hosp-001",
  "hospital_name": "City Medical Center"
}
```

### Using Python

```python
import requests

url = "http://localhost:8000/auth/create-hospital-admin"
payload = {
    "hospital_id": "hosp-001",
    "email": "admin@citymedical.com",
    "password": "TempPassword123",
    "name": "John Admin"
}

response = requests.post(url, json=payload)
print(response.json())
```

### Using Postman

1. **Method**: POST
2. **URL**: `http://localhost:8000/auth/create-hospital-admin`
3. **Headers**: 
   - Content-Type: application/json
4. **Body** (JSON):
   ```json
   {
     "hospital_id": "hosp-001",
     "email": "admin@citymedical.com",
     "password": "TempPassword123",
     "name": "John Admin"
   }
   ```
5. **Send** and copy the `user_id` from response

---

## Step 2️⃣: Login with Default Credentials

### Frontend Login

1. **Open Browser**: Navigate to `http://localhost:3000/hospital/login`

2. **Enter Credentials**:
   - Email: `admin@citymedical.com`
   - Password: `TempPassword123`

3. **Click Login**

4. **Expected Result**: Redirected to hospital dashboard

### Login Page View

```
┌─────────────────────────────────────────┐
│                                         │
│           🏥 Hospital Login             │
│     Access your hospital dashboard      │
│                                         │
│  Email:                                 │
│  [admin@citymedical.com              ] │
│                                         │
│  Password:                              │
│  [••••••••••••••••••••••••••••••••••] │
│                                         │
│         [    Login    ]                 │
│                                         │
│  Don't have an account?                 │
│  Register Hospital                      │
│                                         │
└─────────────────────────────────────────┘
```

### Dashboard After Login

```
┌─────────────────────────────────────────────────────────────┐
│  City Medical Center                                        │
│  Welcome, John Admin • ● Live                               │
│                                                             │
│  [🔄 Refresh] [🔐 Change Password] [Logout]               │
└─────────────────────────────────────────────────────────────┘
│                                                             │
│  Dashboard | Appointments | Book | Departments | Doctors   │
│  Beds | Beds Occupied | Patients | Pharmacy | Alerts       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Hospital Overview                                   │   │
│  │                                                     │   │
│  │ 📋 Today's OPD: 45  👨⚕️ Active Doctors: 8         │   │
│  │ 🛏️ Available Beds: 12  🚨 Emergency: 2            │   │
│  │ ⏱️ Wait Time: 15 min                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 3️⃣: Change Password

### Frontend Change Password Process

1. **Click "🔐 Change Password" Button**
   - Located in the top-right header of dashboard

2. **Modal Opens**:
   ```
   ┌──────────────────────────────────────────┐
   │      Change Password                     │
   │                                          │
   │  Current Password:                       │
   │  [••••••••••••••••••••••••••••••••••]   │
   │                                          │
   │  New Password:                           │
   │  [••••••••••••••••••••••••••••••••••]   │
   │  (min 6 characters)                      │
   │                                          │
   │  Confirm New Password:                   │
   │  [••••••••••••••••••••••••••••••••••]   │
   │                                          │
   │  [Change Password]  [Cancel]             │
   └──────────────────────────────────────────┘
   ```

3. **Fill Form**:
   - **Current Password**: `TempPassword123`
   - **New Password**: `SecurePassword456`
   - **Confirm New Password**: `SecurePassword456`

4. **Click "Change Password"**

5. **Success Message**:
   ```
   ✅ Password changed successfully! 
      Please login again with your new password.
   ```

6. **Auto-Logout**: You'll be logged out and redirected to login page

### Backend API Call (What Happens Behind Scenes)

```bash
curl -X POST http://localhost:8000/auth/change-password \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "admin-user-001",
    "old_password": "TempPassword123",
    "new_password": "SecurePassword456"
  }'
```

### Expected Response

```json
{
  "message": "Password changed successfully"
}
```

---

## Step 4️⃣: Re-Login with New Password

### Frontend Login with New Credentials

1. **Open Browser**: Navigate to `http://localhost:3000/hospital/login`

2. **Enter New Credentials**:
   - Email: `admin@citymedical.com`
   - Password: `SecurePassword456` (NEW PASSWORD)

3. **Click Login**

4. **Expected Result**: Successfully logged in with new password

---

## 📊 Complete Credentials Summary

### Initial Setup
| Field | Value |
|-------|-------|
| Hospital ID | hosp-001 |
| Hospital Name | City Medical Center |
| Admin Name | John Admin |
| Admin Email | admin@citymedical.com |
| **Default Password** | **TempPassword123** |
| User ID | admin-user-001 |

### After Password Change
| Field | Value |
|-------|-------|
| Admin Email | admin@citymedical.com |
| **New Password** | **SecurePassword456** |
| Status | Active |
| Last Updated | 2024-01-15 11:45:00 |

---

## 🔄 Complete Workflow Timeline

```
Time    Action                          Status
────────────────────────────────────────────────────
10:00   Create admin account            ✅ Success
        Email: admin@citymedical.com
        Password: TempPassword123

10:05   Navigate to login page          ✅ Page loaded
        http://localhost:3000/hospital/login

10:06   Enter credentials               ✅ Credentials entered
        Email: admin@citymedical.com
        Password: TempPassword123

10:07   Click Login                     ✅ Logged in
        Redirected to dashboard

10:08   Click "Change Password"         ✅ Modal opened

10:09   Enter password change form      ✅ Form filled
        Old: TempPassword123
        New: SecurePassword456
        Confirm: SecurePassword456

10:10   Click "Change Password"         ✅ Password changed
        Success message shown
        Auto-logout initiated

10:11   Redirected to login page        ✅ At login page

10:12   Enter new credentials           ✅ Credentials entered
        Email: admin@citymedical.com
        Password: SecurePassword456

10:13   Click Login                     ✅ Logged in with new password
        Dashboard accessible
```

---

## 🧪 Testing Scenarios

### Scenario 1: Successful Password Change
```
✅ Current Password: TempPassword123
✅ New Password: SecurePassword456
✅ Confirm: SecurePassword456
✅ Result: Password changed successfully
```

### Scenario 2: Wrong Current Password
```
❌ Current Password: WrongPassword
✅ New Password: SecurePassword456
✅ Confirm: SecurePassword456
❌ Result: "Old password is incorrect"
```

### Scenario 3: New Password Too Short
```
✅ Current Password: TempPassword123
❌ New Password: Pass1 (5 chars)
❌ Confirm: Pass1
❌ Result: "New password must be at least 6 characters"
```

### Scenario 4: Passwords Don't Match
```
✅ Current Password: TempPassword123
✅ New Password: SecurePassword456
❌ Confirm: DifferentPassword789
❌ Result: "New passwords do not match"
```

### Scenario 5: Same as Old Password
```
✅ Current Password: TempPassword123
❌ New Password: TempPassword123
❌ Confirm: TempPassword123
❌ Result: "New password must be different from old password"
```

---

## 🔐 Security Notes

1. **Default Password**: Should be changed immediately after first login
2. **Password Storage**: All passwords are hashed using bcrypt
3. **JWT Token**: Required for change password endpoint
4. **Auto-Logout**: User is logged out after successful password change
5. **Timestamp**: Password change is recorded with timestamp

---

## 📱 Mobile/Responsive View

The change password modal is fully responsive:

### Desktop View (1024px+)
```
┌──────────────────────────────────────────┐
│      Change Password                     │
│                                          │
│  Current Password:                       │
│  [••••••••••••••••••••••••••••••••••]   │
│                                          │
│  New Password:                           │
│  [••••••••••••••••••••••••••••••••••]   │
│                                          │
│  Confirm New Password:                   │
│  [••••••••••••••••••••••••••••••••••]   │
│                                          │
│  [Change Password]  [Cancel]             │
└──────────────────────────────────────────┘
```

### Mobile View (< 768px)
```
┌──────────────────────┐
│  Change Password     │
│                      │
│  Current Password:   │
│  [••••••••••••••]   │
│                      │
│  New Password:       │
│  [••••••••••••••]   │
│                      │
│  Confirm Password:   │
│  [••••••••••••••]   │
│                      │
│  [Change Password]   │
│  [Cancel]            │
└──────────────────────┘
```

---

## 🆘 Troubleshooting

### Issue: Can't find "Change Password" button
**Solution**: 
- Ensure you're logged in as hospital_admin
- Refresh the page (F5)
- Check browser console for errors

### Issue: "User not found" error
**Solution**:
- Verify user_id is correct
- Ensure user exists in database
- Check hospital_id matches

### Issue: Modal doesn't close after password change
**Solution**:
- Check browser console for errors
- Verify token is valid
- Try refreshing page

### Issue: Can't login with new password
**Solution**:
- Verify new password was saved (check database)
- Ensure password is case-sensitive
- Try resetting password via API

---

## 📞 Support

For issues:
1. Check browser console (F12)
2. Check backend logs: `http://localhost:8000/docs`
3. Verify Firebase Firestore connection
4. Review this guide's troubleshooting section

---

**Example Version**: 1.0
**Last Updated**: 2024
**Status**: Ready for Production
