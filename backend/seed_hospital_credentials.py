import firebase_admin
from firebase_admin import credentials, firestore
import bcrypt
from datetime import datetime
import json

try:
    cred = credentials.Certificate('firebase-key.json')
    firebase_admin.initialize_app(cred)
except ValueError:
    pass  # already initialized

db = firestore.client()

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_hospital_admin_credentials():
    hospitals_ref = db.collection("hospitals").stream()
    hospitals_list = []

    for hospital_doc in hospitals_ref:
        hospital_data = hospital_doc.to_dict()
        hospital_data['doc_id'] = hospital_doc.id
        hospitals_list.append(hospital_data)

    if not hospitals_list:
        print("No hospitals found in database.")
        return

    print(f"\n{'='*70}")
    print(f"Found {len(hospitals_list)} hospitals")
    print(f"{'='*70}\n")

    admin_credentials = []
    created_count = 0
    skipped_count = 0

    for idx, hospital in enumerate(hospitals_list, 1):
        hospital_id = hospital.get('hospital_id') or hospital.get('doc_id')
        hospital_name = hospital.get('hospital_name', f'Hospital {idx}')

        email = f"admin.{hospital_name.lower().replace(' ', '_').replace('-', '_')}@hospital.com"
        password = f"Hospital@{idx}123"

        existing_admin = list(db.collection("users").where("hospital_id", "==", hospital_id).where("role", "==", "hospital_admin").stream())

        if existing_admin:
            print(f"Skipping {hospital_name} - Admin already exists")
            skipped_count += 1
            continue

        user_data = {
            "name": f"{hospital_name} Admin",
            "email": email,
            "phone": hospital.get('contact_number', ''),
            "role": "hospital_admin",
            "password": hash_password(password),
            "hospital_id": hospital_id,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }

        db.collection("users").add(user_data)
        created_count += 1

        admin_credentials.append({
            "hospital_name": hospital_name,
            "hospital_id": hospital_id,
            "email": email,
            "password": password
        })

        print(f"Created: {hospital_name}")
        print(f"  Email:    {email}")
        print(f"  Password: {password}")
        print(f"  ID:       {hospital_id}\n")

    print(f"\nSeeded {created_count} credentials, skipped {skipped_count} (already exist)")

    if created_count == 0:
        return

    with open('HOSPITAL_ADMIN_CREDENTIALS.txt', 'w') as f:
        f.write("="*70 + "\n")
        f.write("HOSPITAL ADMIN LOGIN CREDENTIALS\n")
        f.write("="*70 + "\n\n")
        for c in admin_credentials:
            f.write(f"Hospital: {c['hospital_name']}\n")
            f.write(f"Email:    {c['email']}\n")
            f.write(f"Password: {c['password']}\n")
            f.write(f"ID:       {c['hospital_id']}\n")
            f.write("-"*70 + "\n\n")

    with open('HOSPITAL_ADMIN_CREDENTIALS.json', 'w') as f:
        json.dump(admin_credentials, f, indent=2)

    print(f"Credentials saved to HOSPITAL_ADMIN_CREDENTIALS.txt and .json")

if __name__ == "__main__":
    try:
        create_hospital_admin_credentials()
    except Exception as e:
        print(f"Error: {str(e)}")
