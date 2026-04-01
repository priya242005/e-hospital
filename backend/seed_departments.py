"""
Seed script to create departments for each hospital
Run this script to generate standard departments for all hospitals
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import uuid

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

# Standard departments for hospitals
STANDARD_DEPARTMENTS = [
    {
        "name": "General Medicine",
        "description": "General medical care and treatment"
    },
    {
        "name": "Cardiology",
        "description": "Heart and cardiovascular diseases"
    },
    {
        "name": "Orthopedics",
        "description": "Bone and joint disorders"
    },
    {
        "name": "Pediatrics",
        "description": "Child healthcare and treatment"
    },
    {
        "name": "Neurology",
        "description": "Nervous system disorders"
    },
    {
        "name": "Dermatology",
        "description": "Skin diseases and treatment"
    },
    {
        "name": "ENT",
        "description": "Ear, Nose, and Throat disorders"
    },
    {
        "name": "Ophthalmology",
        "description": "Eye care and vision treatment"
    },
    {
        "name": "Psychiatry",
        "description": "Mental health and psychological disorders"
    },
    {
        "name": "Surgery",
        "description": "Surgical procedures and operations"
    }
]

def create_departments_for_hospitals():
    """Create standard departments for all hospitals"""
    
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
    
    total_departments_created = 0
    
    for hospital in hospitals_list:
        hospital_id = hospital.get('hospital_id') or hospital.get('doc_id')
        hospital_name = hospital.get('hospital_name', 'Unknown Hospital')
        
        # Check existing departments
        existing_depts = db.collection("departments").where("hospital_id", "==", hospital_id).stream()
        existing_depts_list = list(existing_depts)
        
        if existing_depts_list:
            print(f"⏭️  {hospital_name} - Already has {len(existing_depts_list)} departments")
            continue
        
        print(f"🏥 Creating departments for: {hospital_name}")
        
        for dept in STANDARD_DEPARTMENTS:
            department_id = str(uuid.uuid4())
            
            dept_data = {
                "department_id": department_id,
                "hospital_id": hospital_id,
                "department_name": dept["name"],
                "description": dept["description"],
                "status": "active",
                "created_at": datetime.utcnow().isoformat()
            }
            
            db.collection("departments").add(dept_data)
            total_departments_created += 1
            print(f"   ✅ {dept['name']}")
        
        print()
    
    print("\n" + "="*70)
    print(f"✅ Successfully created {total_departments_created} departments!")
    print("="*70 + "\n")

if __name__ == "__main__":
    try:
        create_departments_for_hospitals()
    except Exception as e:
        print(f"❌ Error: {str(e)}")
