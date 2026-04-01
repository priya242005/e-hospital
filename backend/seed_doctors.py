"""
Seed script to create sample doctors for each hospital and department
Run this script to generate doctors for all hospitals
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import uuid
import bcrypt

# Initialize Firebase
try:
    cred = credentials.Certificate('backend/e-hospital-firebase-key.json')
    firebase_admin.initialize_app(cred)
except:
    try:
        cred = credentials.Certificate('e-hospital-firebase-key.json')
        firebase_admin.initialize_app(cred)
    except:
        print("❌ Firebase credentials file not found!")
        exit(1)

db = firestore.client()

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Sample doctors data
SAMPLE_DOCTORS = [
    {"name": "Dr. Rajesh Kumar", "specialization": "Cardiologist", "contact": "555-0101"},
    {"name": "Dr. Priya Singh", "specialization": "Pediatrician", "contact": "555-0102"},
    {"name": "Dr. Amit Patel", "specialization": "Orthopedic Surgeon", "contact": "555-0103"},
    {"name": "Dr. Neha Sharma", "specialization": "Neurologist", "contact": "555-0104"},
    {"name": "Dr. Vikram Desai", "specialization": "General Surgeon", "contact": "555-0105"},
]

def create_doctors_for_hospitals():
    """Create sample doctors for all hospitals"""
    
    # Get all hospitals
    hospitals_ref = db.collection("hospitals").stream()
    hospitals_list = []
    
    for hospital_doc in hospitals_ref:
        hospital_data = hospital_doc.to_dict()
        hospital_data['doc_id'] = hospital_doc.id
        hospitals_list.append(hospital_data)
    
    if not hospitals_list:
        print("❌ No hospitals found in database.")
        return
    
    print(f"\n{'='*70}")
    print(f"📋 Found {len(hospitals_list)} hospitals")
    print(f"{'='*70}\n")
    
    total_doctors_created = 0
    
    for hospital in hospitals_list:
        hospital_id = hospital.get('hospital_id') or hospital.get('doc_id')
        hospital_name = hospital.get('hospital_name', 'Unknown Hospital')
        
        # Get departments for this hospital
        depts_ref = db.collection("departments").where("hospital_id", "==", hospital_id).stream()
        depts_list = list(depts_ref)
        
        if not depts_list:
            print(f"⏭️  {hospital_name} - No departments found. Create departments first.")
            continue
        
        # Check existing doctors
        existing_doctors = db.collection("doctors").where("hospital_id", "==", hospital_id).stream()
        existing_doctors_list = list(existing_doctors)
        
        if existing_doctors_list:
            print(f"⏭️  {hospital_name} - Already has {len(existing_doctors_list)} doctors")
            continue
        
        print(f"🏥 Creating doctors for: {hospital_name}")
        
        doctor_idx = 1
        for dept_doc in depts_list:
            dept_data = dept_doc.to_dict()
            department_id = dept_data.get('department_id')
            department_name = dept_data.get('department_name')
            
            # Create 1-2 doctors per department
            num_doctors = 1 if doctor_idx % 2 == 0 else 2
            
            for i in range(num_doctors):
                if doctor_idx > len(SAMPLE_DOCTORS):
                    doctor_idx = 1
                
                sample_doctor = SAMPLE_DOCTORS[doctor_idx - 1]
                doctor_id = str(uuid.uuid4())
                email = f"dr.{sample_doctor['name'].lower().replace(' ', '_').replace('.', '')}_{hospital_id[:8]}@hospital.com"
                password = f"Doctor@{doctor_idx}123"
                
                doctor_data = {
                    "doctor_id": doctor_id,
                    "hospital_id": hospital_id,
                    "department_id": department_id,
                    "name": sample_doctor["name"],
                    "specialization": sample_doctor["specialization"],
                    "contact_number": sample_doctor["contact"],
                    "email": email,
                    "password": hash_password(password),
                    "availability": "available",
                    "max_load": 20,
                    "current_load": 0,
                    "status": "active",
                    "created_at": datetime.utcnow().isoformat()
                }
                
                db.collection("doctors").add(doctor_data)
                total_doctors_created += 1
                print(f"   ✅ {sample_doctor['name']} - {department_name}")
                print(f"      Email: {email}")
                print(f"      Password: {password}\n")
                
                doctor_idx += 1
    
    print("\n" + "="*70)
    print(f"✅ Successfully created {total_doctors_created} doctors!")
    print("="*70 + "\n")

if __name__ == "__main__":
    try:
        create_doctors_for_hospitals()
    except Exception as e:
        print(f"❌ Error: {str(e)}")
