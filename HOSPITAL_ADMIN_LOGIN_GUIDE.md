# Hospital Admin Login & Change Password Guide

## Overview
Hospital admins can now login with default credentials and change their password immediately after first login for security purposes.

## Default Credentials

After creating a hospital admin account via the API endpoint, you'll receive:
- **Email**: The email you provided during creation
- **Password**: The password you provided during creation

### Example Default Credentials
```
Email: admin@hospital.com
Password: SecurePassword123
```

## Step 1: Create Hospital Admin Account

### Method 1: Using API Endpoint

**Endpoint**: `POST /auth/create-hospital-admin`

**Request**:
```bash
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "your-hospital-id",
    "email": "admin@hospital.com",
    "password": "SecurePassword123",
    "name": "Hospital Admin"
  }'
```

**Response**:
```json
{
  "message": "Hospital admin created successfully",
  "user_id": "admin-user-id",
  "email": "admin@hospital.com",
  "hospital_id": "your-hospital-id",
  "hospital_name": "Your Hospital Name"
}
```

### Method 2: Using Python Script

Create `create_admin.py`:
```python
import requests

def create_hospital_admin(hospital_id, email, password, name):
    url = "http://localhost:8000/auth/create-hospital-admin"
    payload = {
        "hospital_id": hospital_id,
        "email": email,
        "password": password,
        "name": name
    }
    response = requests.post(url, json=payload)
    return response.json()

# Example usage
result = create_hospital_admin(
    hospital_id="hospital-123",
    email="admin@hospital.com",
    password="SecurePassword123",
    name="Hospital Admin"
)
print(result)
```

Run:
```bash
python create_admin.py
```

## Step 2: Login with Default Credentials

### Frontend Login Process

1. **Navigate to Hospital Login**
   - Go to: `http://localhost:3000/hospital/login`

2. **Enter Credentials**
   - Email: `admin@hospital.com`
   - Password: `SecurePassword123`

3. **Click Login**
   - You'll be redirected to the hospital dashboard

### Login Page Screenshot
```
┌─────────────────────────────────────┐
│         🏥 Hospital Login           │
│   Access your hospital dashboard    │
│                                     │
│  Email: [admin@hospital.com      ] │
│  Password: [••••••••••••••••••••] │
│                                     │
│        [    Login    ]              │
│                                     │
│  Don't have an account?             │
│  Register Hospital                  │
└─────────────────────────────────────┘
```

## Step 3: Change Password After Login

### Frontend Change Password Process

1. **Access Change Password**
   - After successful login, you'll see the hospital dashboard
   - Click the **"🔐 Change Password"** button in the top-right header

2. **Fill Change Password Form**
   - **Current Password**: Enter your default password
   - **New Password**: Enter your new secure password (min 6 characters)
   - **Confirm New Password**: Re-enter the new password

3. **Submit**
   - Click **"Change Password"** button
   - You'll see a success message
   - You'll be automatically logged out and redirected to login page

4. **Login with New Password**
   - Use your new password to login

### Change Password Modal Screenshot
```
┌──────────────────────────────────────┐
│      Change Password                 │
│                                      │
│  Current Password:                   │
│  [••••••••••••••••••••••••••••••]   │
│                                      │
│  New Password:                       │
│  [••••••••••••••••••••••••••••••]   │
│  (min 6 characters)                  │
│                                      │
│  Confirm New Password:               │
│  [••••••••••••••••••••••••••••••]   │
│                                      │
│  [Change Password]  [Cancel]         │
└──────────────────────────────────────┘
```

## Backend Implementation Details

### Change Password Endpoint

**Endpoint**: `POST /auth/change-password`

**Request Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "user_id": "admin-user-id",
  "old_password": "SecurePassword123",
  "new_password": "NewSecurePassword456"
}
```

**Response (Success)**:
```json
{
  "message": "Password changed successfully"
}
```

**Response (Error - Old Password Incorrect)**:
```json
{
  "detail": "Old password is incorrect"
}
```

**Response (Error - New Password Too Short)**:
```json
{
  "detail": "New password must be at least 6 characters"
}
```

**Response (Error - Same Password)**:
```json
{
  "detail": "New password must be different from old password"
}
```

### Password Validation Rules

1. **Minimum Length**: 6 characters
2. **Must be Different**: New password cannot be same as old password
3. **Old Password Verification**: Must correctly verify old password using bcrypt
4. **Secure Storage**: New password is hashed using bcrypt before storage

## Security Features

✅ **Password Hashing**: All passwords are hashed using bcrypt with salt
✅ **Old Password Verification**: Old password must be verified before change
✅ **Validation**: New password must meet minimum requirements
✅ **JWT Authentication**: Change password endpoint requires valid JWT token
✅ **Automatic Logout**: User is logged out after successful password change
✅ **Timestamp Tracking**: Password change timestamp is recorded in database

## Troubleshooting

### Issue: "Old password is incorrect"
**Solution**: Verify you're entering the correct current password. Passwords are case-sensitive.

### Issue: "New password must be at least 6 characters"
**Solution**: Enter a password with at least 6 characters.

### Issue: "New password must be different from old password"
**Solution**: Choose a different password than your current one.

### Issue: "User not found"
**Solution**: Ensure you're logged in with a valid hospital admin account.

### Issue: Change password button not visible
**Solution**: 
- Ensure you're logged in as hospital_admin role
- Refresh the page
- Check browser console for errors

## Best Practices

1. **Change Default Password Immediately**: Always change your default password after first login
2. **Use Strong Passwords**: Include uppercase, lowercase, numbers, and special characters
3. **Don't Share Credentials**: Keep your login credentials confidential
4. **Regular Password Updates**: Change password periodically for security
5. **Secure Password Storage**: Never store passwords in plain text or share them

## API Testing with Postman

### 1. Create Hospital Admin
```
POST http://localhost:8000/auth/create-hospital-admin
Body (JSON):
{
  "hospital_id": "hospital-123",
  "email": "admin@hospital.com",
  "password": "SecurePassword123",
  "name": "Hospital Admin"
}
```

### 2. Login
```
POST http://localhost:8000/auth/login
Body (JSON):
{
  "email": "admin@hospital.com",
  "password": "SecurePassword123"
}
```
Copy the `access_token` from response.

### 3. Change Password
```
POST http://localhost:8000/auth/change-password
Headers:
  Authorization: Bearer <access_token>
Body (JSON):
{
  "user_id": "admin-user-id",
  "old_password": "SecurePassword123",
  "new_password": "NewSecurePassword456"
}
```

## Database Schema

### Users Collection
```
{
  "user_id": "auto-generated",
  "name": "Hospital Admin",
  "email": "admin@hospital.com",
  "password": "bcrypt-hashed-password",
  "role": "hospital_admin",
  "hospital_id": "hospital-123",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T11:45:00"
}
```

## Frontend Components

### ChangePasswordModal.jsx
- Location: `src/hospital/components/ChangePasswordModal.jsx`
- Features:
  - Form validation
  - Error handling
  - Success message
  - Auto-logout after password change
  - Responsive design

### HospitalDashboard.jsx
- Location: `src/hospital/pages/HospitalDashboard.jsx`
- Updates:
  - Import ChangePasswordModal component
  - Add state for modal visibility
  - Add "Change Password" button in header
  - Render modal component

## Complete Workflow Example

```
1. Create Hospital Admin
   ↓
2. Receive default credentials (email + password)
   ↓
3. Navigate to http://localhost:3000/hospital/login
   ↓
4. Enter default credentials
   ↓
5. Click Login
   ↓
6. See hospital dashboard
   ↓
7. Click "🔐 Change Password" button
   ↓
8. Enter current password + new password
   ↓
9. Click "Change Password"
   ↓
10. See success message
    ↓
11. Auto-logout and redirect to login
    ↓
12. Login with new password
    ↓
13. Access dashboard with new credentials
```

## Support

For issues or questions:
- Check the troubleshooting section above
- Review backend logs: `http://localhost:8000/docs`
- Check browser console for frontend errors
- Verify Firebase Firestore connection

---

**Last Updated**: 2024
**Version**: 1.0
