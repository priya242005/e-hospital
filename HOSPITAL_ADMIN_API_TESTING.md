# Hospital Admin API Testing Guide

## 🧪 Testing All Endpoints

Complete examples for testing hospital admin login and password change endpoints.

---

## 1️⃣ Create Hospital Admin Account

### Using cURL

```bash
curl -X POST http://localhost:8000/auth/create-hospital-admin \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "hosp-001",
    "email": "admin@hospital.com",
    "password": "DefaultPassword123",
    "name": "Hospital Admin"
  }'
```

### Using Python

```python
import requests

url = "http://localhost:8000/auth/create-hospital-admin"
payload = {
    "hospital_id": "hosp-001",
    "email": "admin@hospital.com",
    "password": "DefaultPassword123",
    "name": "Hospital Admin"
}

response = requests.post(url, json=payload)
print(response.json())

# Save user_id for later use
user_id = response.json()["user_id"]
print(f"User ID: {user_id}")
```

### Using Postman

1. **Create New Request**
   - Method: POST
   - URL: `http://localhost:8000/auth/create-hospital-admin`

2. **Headers Tab**
   ```
   Content-Type: application/json
   ```

3. **Body Tab** (select JSON)
   ```json
   {
     "hospital_id": "hosp-001",
     "email": "admin@hospital.com",
     "password": "DefaultPassword123",
     "name": "Hospital Admin"
   }
   ```

4. **Send**

5. **Response**
   ```json
   {
     "message": "Hospital admin created successfully",
     "user_id": "admin-user-001",
     "email": "admin@hospital.com",
     "hospital_id": "hosp-001",
     "hospital_name": "Your Hospital Name"
   }
   ```

---

## 2️⃣ Login with Default Credentials

### Using cURL

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "DefaultPassword123"
  }'
```

### Using Python

```python
import requests

url = "http://localhost:8000/auth/login"
payload = {
    "email": "admin@hospital.com",
    "password": "DefaultPassword123"
}

response = requests.post(url, json=payload)
data = response.json()
print(data)

# Save token for later use
access_token = data["access_token"]
print(f"Access Token: {access_token}")
```

### Using Postman

1. **Create New Request**
   - Method: POST
   - URL: `http://localhost:8000/auth/login`

2. **Headers Tab**
   ```
   Content-Type: application/json
   ```

3. **Body Tab** (select JSON)
   ```json
   {
     "email": "admin@hospital.com",
     "password": "DefaultPassword123"
   }
   ```

4. **Send**

5. **Response**
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "token_type": "bearer",
     "role": "hospital_admin",
     "user_id": "admin-user-001",
     "hospital_id": "hosp-001",
     "user": {
       "user_id": "admin-user-001",
       "name": "Hospital Admin",
       "email": "admin@hospital.com",
       "role": "hospital_admin",
       "hospital_id": "hosp-001",
       "hospital_name": "Your Hospital Name"
     }
   }
   ```

6. **Save Token** for next request
   - Copy `access_token` value
   - Use in Authorization header for change password

---

## 3️⃣ Change Password

### Using cURL

```bash
curl -X POST http://localhost:8000/auth/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "admin-user-001",
    "old_password": "DefaultPassword123",
    "new_password": "NewSecurePassword456"
  }'
```

### Using Python

```python
import requests

url = "http://localhost:8000/auth/change-password"
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}
payload = {
    "user_id": "admin-user-001",
    "old_password": "DefaultPassword123",
    "new_password": "NewSecurePassword456"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

### Using Postman

1. **Create New Request**
   - Method: POST
   - URL: `http://localhost:8000/auth/change-password`

2. **Headers Tab**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json
   ```
   
   **Note**: Replace token with actual access_token from login response

3. **Body Tab** (select JSON)
   ```json
   {
     "user_id": "admin-user-001",
     "old_password": "DefaultPassword123",
     "new_password": "NewSecurePassword456"
   }
   ```

4. **Send**

5. **Response (Success)**
   ```json
   {
     "message": "Password changed successfully"
   }
   ```

---

## 4️⃣ Get Hospital Admins

### Using cURL

```bash
curl -X GET http://localhost:8000/auth/hospital-admins/hosp-001 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Using Python

```python
import requests

url = "http://localhost:8000/auth/hospital-admins/hosp-001"
headers = {
    "Authorization": f"Bearer {access_token}"
}

response = requests.get(url, headers=headers)
print(response.json())
```

### Using Postman

1. **Create New Request**
   - Method: GET
   - URL: `http://localhost:8000/auth/hospital-admins/hosp-001`

2. **Headers Tab**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Send**

4. **Response**
   ```json
   [
     {
       "user_id": "admin-user-001",
       "name": "Hospital Admin",
       "email": "admin@hospital.com",
       "role": "hospital_admin",
       "hospital_id": "hosp-001",
       "created_at": "2024-01-15T10:30:00"
     }
   ]
   ```

---

## 🧪 Error Testing

### Test 1: Wrong Old Password

```bash
curl -X POST http://localhost:8000/auth/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "admin-user-001",
    "old_password": "WrongPassword",
    "new_password": "NewPassword456"
  }'
```

**Expected Response**:
```json
{
  "detail": "Old password is incorrect"
}
```

---

### Test 2: New Password Too Short

```bash
curl -X POST http://localhost:8000/auth/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "admin-user-001",
    "old_password": "DefaultPassword123",
    "new_password": "Pass1"
  }'
```

**Expected Response**:
```json
{
  "detail": "New password must be at least 6 characters"
}
```

---

### Test 3: Same Password

```bash
curl -X POST http://localhost:8000/auth/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "admin-user-001",
    "old_password": "DefaultPassword123",
    "new_password": "DefaultPassword123"
  }'
```

**Expected Response**:
```json
{
  "detail": "New password must be different from old password"
}
```

---

### Test 4: User Not Found

```bash
curl -X POST http://localhost:8000/auth/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "non-existent-user",
    "old_password": "DefaultPassword123",
    "new_password": "NewPassword456"
  }'
```

**Expected Response**:
```json
{
  "detail": "User not found"
}
```

---

## 📊 Complete Test Workflow Script

### Python Script

```python
import requests
import json

BASE_URL = "http://localhost:8000"

def print_response(title, response):
    print(f"\n{'='*50}")
    print(f"{title}")
    print(f"{'='*50}")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

# Step 1: Create Hospital Admin
print("\n🔧 STEP 1: Creating Hospital Admin Account...")
create_response = requests.post(
    f"{BASE_URL}/auth/create-hospital-admin",
    json={
        "hospital_id": "hosp-001",
        "email": "admin@hospital.com",
        "password": "DefaultPassword123",
        "name": "Hospital Admin"
    }
)
print_response("Create Hospital Admin", create_response)
user_id = create_response.json()["user_id"]

# Step 2: Login with Default Credentials
print("\n🔧 STEP 2: Logging in with Default Credentials...")
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "admin@hospital.com",
        "password": "DefaultPassword123"
    }
)
print_response("Login", login_response)
access_token = login_response.json()["access_token"]

# Step 3: Change Password
print("\n🔧 STEP 3: Changing Password...")
change_response = requests.post(
    f"{BASE_URL}/auth/change-password",
    headers={"Authorization": f"Bearer {access_token}"},
    json={
        "user_id": user_id,
        "old_password": "DefaultPassword123",
        "new_password": "NewSecurePassword456"
    }
)
print_response("Change Password", change_response)

# Step 4: Try Login with Old Password (Should Fail)
print("\n🔧 STEP 4: Trying Login with Old Password (Should Fail)...")
old_login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "admin@hospital.com",
        "password": "DefaultPassword123"
    }
)
print_response("Login with Old Password", old_login_response)

# Step 5: Login with New Password (Should Succeed)
print("\n🔧 STEP 5: Logging in with New Password...")
new_login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "admin@hospital.com",
        "password": "NewSecurePassword456"
    }
)
print_response("Login with New Password", new_login_response)

# Step 6: Get Hospital Admins
print("\n🔧 STEP 6: Getting Hospital Admins...")
new_token = new_login_response.json()["access_token"]
admins_response = requests.get(
    f"{BASE_URL}/auth/hospital-admins/hosp-001",
    headers={"Authorization": f"Bearer {new_token}"}
)
print_response("Get Hospital Admins", admins_response)

print("\n✅ All tests completed!")
```

**Run**:
```bash
python test_hospital_admin.py
```

---

## 📋 Postman Collection

### Import Collection

Create file `hospital-admin-api.json`:

```json
{
  "info": {
    "name": "Hospital Admin API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Hospital Admin",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"hospital_id\": \"hosp-001\",\n  \"email\": \"admin@hospital.com\",\n  \"password\": \"DefaultPassword123\",\n  \"name\": \"Hospital Admin\"\n}"
        },
        "url": {
          "raw": "http://localhost:8000/auth/create-hospital-admin",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["auth", "create-hospital-admin"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@hospital.com\",\n  \"password\": \"DefaultPassword123\"\n}"
        },
        "url": {
          "raw": "http://localhost:8000/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["auth", "login"]
        }
      }
    },
    {
      "name": "Change Password",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"user_id\": \"{{user_id}}\",\n  \"old_password\": \"DefaultPassword123\",\n  \"new_password\": \"NewSecurePassword456\"\n}"
        },
        "url": {
          "raw": "http://localhost:8000/auth/change-password",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["auth", "change-password"]
        }
      }
    },
    {
      "name": "Get Hospital Admins",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:8000/auth/hospital-admins/hosp-001",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["auth", "hospital-admins", "hosp-001"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "access_token",
      "value": ""
    },
    {
      "key": "user_id",
      "value": ""
    }
  ]
}
```

**Import Steps**:
1. Open Postman
2. Click "Import"
3. Paste the JSON above
4. Click "Import"
5. Use the collection to test endpoints

---

## 🔍 Debugging Tips

### Enable Verbose Output in cURL

```bash
curl -v -X POST http://localhost:8000/auth/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Check Backend Logs

```bash
# Terminal where FastAPI is running
# Look for request/response logs
```

### Check Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Perform action
4. Click request
5. View request/response

### Verify Token

```bash
# Decode JWT token at https://jwt.io
# Paste access_token to see payload
```

---

## ✅ Testing Checklist

- [ ] Create hospital admin account
- [ ] Login with default credentials
- [ ] Verify access_token received
- [ ] Change password successfully
- [ ] Verify old password fails
- [ ] Verify new password works
- [ ] Get hospital admins list
- [ ] Test error scenarios
- [ ] Verify database updates
- [ ] Check timestamps

---

## 📞 Support

For issues:
1. Check response status code
2. Read error message
3. Verify request format
4. Check authorization header
5. Review backend logs

---

**Version**: 1.0
**Last Updated**: 2024
