import sys
sys.path.insert(0, '/path/to/backend')

from app.firebase import db
from app.auth_utils import get_password_hash
import bcrypt
from datetime import datetime

# Get first hospital
hospitals = list(db.collection("hospitals").limit(1).stream())
if not hospitals:
    print("No hospitals found. Please create a hospital first.")
    sys.exit(1)

hospital_id = hospitals[0].id
hospital_name = hospitals[0].to_dict().get("hospital_name", "Hospital")

# Create pharmacy user
pharmacy_email = "pharmacy@test.com"
pharmacy_password = "password123"

# Check if already exists
existing = list(db.collection("users").where("email", "==", pharmacy_email).limit(1).stream())
if existing:
    print(f"Pharmacy user {pharmacy_email} already exists")
else:
    hashed_password = bcrypt.hashpw(pharmacy_password.encode('utf-8'), bcrypt.gensalt())
    
    user_data = {
        "name": "Pharmacy Staff",
        "email": pharmacy_email,
        "phone": "9876543210",
        "role": "pharmacy",
        "password": hashed_password.decode('utf-8'),
        "hospital_id": hospital_id,
        "pharmacy_name": f"{hospital_name} Pharmacy",
        "address": "Pharmacy Department",
        "created_at": datetime.utcnow().isoformat()
    }
    
    db.collection("users").add(user_data)
    print(f"✅ Pharmacy user created: {pharmacy_email} / {pharmacy_password}")
    print(f"   Hospital: {hospital_name}")
