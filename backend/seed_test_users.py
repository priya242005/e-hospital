"""
Test Data Seeding Script
Run this to create test users for each role
"""

import requests
import json

BASE_URL = "http://localhost:8000"

# Test users to create
test_users = [
    {
        "name": "Test Patient",
        "email": "patient@test.com",
        "phone": "1234567890",
        "password": "password123",
        "role": "patient"
    },
    {
        "name": "Hospital Admin",
        "email": "hospital@test.com",
        "phone": "1234567891",
        "password": "password123",
        "role": "hospital_admin"
    },
    {
        "name": "Pharmacy Admin",
        "email": "pharmacy@test.com",
        "phone": "1234567892",
        "password": "password123",
        "role": "pharmacy_admin"
    },
    {
        "name": "Super Admin",
        "email": "admin@test.com",
        "phone": "1234567893",
        "password": "password123",
        "role": "super_admin"
    }
]

def create_test_users():
    print("Creating test users...")
    
    for user in test_users:
        try:
            response = requests.post(f"{BASE_URL}/auth/register", json=user)
            if response.status_code == 200:
                print(f"✅ Created {user['role']}: {user['email']}")
            else:
                print(f"❌ Failed to create {user['email']}: {response.json()}")
        except Exception as e:
            print(f"❌ Error creating {user['email']}: {str(e)}")
    
    print("\n" + "="*50)
    print("TEST CREDENTIALS:")
    print("="*50)
    for user in test_users:
        print(f"{user['role'].upper()}")
        print(f"  Email: {user['email']}")
        print(f"  Password: {user['password']}")
        print()

if __name__ == "__main__":
    create_test_users()
