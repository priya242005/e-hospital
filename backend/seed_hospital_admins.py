"""
Seed script to create hospital admin credentials for each hospital
Run this script to generate login credentials for hospital staff
"""

import firebase_admin
from firebase_admin import credentials, firestore
import bcrypt
from datetime import datetime

# Initialize Firebase
cred = credentials.Certificate('backend/your-firebase-credentials.json')  # Update path
firebase_admin.initialize_app(cred)
db = firestore.client()

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_hospital_admins():
    """Create admin credentials for each hospital"""
    
    # Get all hospitals
    hospitals = db.collection("hospitals").stream()
    hospitals_list = [h.to_dict() for h in hospitals]
    
    if not hospitals_list:
        print("❌ No hospitals found. Please create hospitals first.")
        return
    
    print(f"\n📋 Found {len(hospitals_list)} hospitals\n")
    
    admin_credentials = []
    
    for idx, hospital in enumerate(hospitals_list, 1):
        hospital_id = hospital.get('hospital_id')
        hospital_name = hospital.get('hospital_name', f'Hospital {idx}')
        
        # Generate credentials
        email = f"admin.{hospital_name.lower().replace(' ', '_')}@hospital.com"
        password = f"Hospital@{idx}123"  # Format: Hospital@1123, Hospital@2123, etc.
        
        # Create user document
        user_data = {
            "name": f"{hospital_name} Admin",
            "email": email,
            "phone": hospital.get('contact_number', ''),
            "role": "hospital_admin",
            "password": hash_password(password),
            "hospital_id": hospital_id,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Add to users collection
        db.collection("users").add(user_data)
        
        admin_credentials.append({
            "hospital_name": hospital_name,
            "email": email,
            "password": password,
            "hospital_id": hospital_id
        })
        
        print(f"✅ Created admin for: {hospital_name}")
        print(f"   Email: {email}")
        print(f"   Password: {password}\n")
    
    # Save credentials to file
    with open('backend/HOSPITAL_ADMIN_CREDENTIALS.txt', 'w') as f:
        f.write("=" * 70 + "\n")
        f.write("HOSPITAL ADMIN LOGIN CREDENTIALS\n")
        f.write("=" * 70 + "\n\n")
        f.write("⚠️  KEEP THIS FILE SECURE - DO NOT SHARE\n\n")
        
        for cred in admin_credentials:
            f.write(f"Hospital: {cred['hospital_name']}\n")
            f.write(f"Email: {cred['email']}\n")
            f.write(f"Password: {cred['password']}\n")
            f.write(f"Hospital ID: {cred['hospital_id']}\n")
            f.write("-" * 70 + "\n\n")
    
    print("\n" + "=" * 70)
    print("✅ All admin credentials created successfully!")
    print("=" * 70)
    print("\n📄 Credentials saved to: backend/HOSPITAL_ADMIN_CREDENTIALS.txt")
    print("\n🔐 Login Instructions:")
    print("1. Go to http://localhost:3000/admin/login")
    print("2. Select hospital from dropdown")
    print("3. Enter email and password")
    print("4. Click 'Login as Admin'")
    print("5. Add bed data for your hospital")
    print("\n" + "=" * 70 + "\n")

if __name__ == "__main__":
    try:
        create_hospital_admins()
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("\nMake sure:")
        print("1. Firebase credentials file path is correct")
        print("2. Hospitals are already created in database")
        print("3. Firebase is properly initialized")
