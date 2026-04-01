"""
Seed script to create sample beds for each hospital
Run this script to generate beds for all hospitals
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

# Standard bed configuration for hospitals
BED_CONFIGURATION = {
    "general": {"wards": 3, "beds_per_ward": 10},
    "icu": {"wards": 1, "beds_per_ward": 5},
    "emergency": {"wards": 1, "beds_per_ward": 8}
}

def create_beds_for_hospitals():
    """Create sample beds for all hospitals"""
    
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
    
    total_beds_created = 0
    
    for hospital in hospitals_list:
        hospital_id = hospital.get('hospital_id') or hospital.get('doc_id')
        hospital_name = hospital.get('hospital_name', 'Unknown Hospital')
        
        # Check existing beds
        existing_beds = db.collection("bed_management").where("hospital_id", "==", hospital_id).stream()
        existing_beds_list = list(existing_beds)
        
        if existing_beds_list:
            print(f"⏭️  {hospital_name} - Already has {len(existing_beds_list)} beds")
            continue
        
        print(f"🏥 Creating beds for: {hospital_name}")
        
        for bed_type, config in BED_CONFIGURATION.items():
            num_wards = config["wards"]
            beds_per_ward = config["beds_per_ward"]
            
            for ward_num in range(1, num_wards + 1):
                ward_name = f"{bed_type.capitalize()} Ward"
                ward_number = f"W{bed_type[0].upper()}{ward_num}"
                
                for bed_num in range(1, beds_per_ward + 1):
                    bed_id = str(uuid.uuid4())
                    bed_number = f"{ward_number}-{bed_num}"
                    
                    bed_data = {
                        "bed_id": bed_id,
                        "hospital_id": hospital_id,
                        "ward_name": ward_name,
                        "ward_number": ward_number,
                        "bed_number": bed_number,
                        "bed_type": bed_type,
                        "status": "available",
                        "patient_id": None,
                        "assigned_date": None,
                        "created_at": datetime.utcnow().isoformat()
                    }
                    
                    db.collection("bed_management").add(bed_data)
                    total_beds_created += 1
                
                print(f"   ✅ {ward_name} ({ward_number}): {beds_per_ward} beds")
        
        print()
    
    print("\n" + "="*70)
    print(f"✅ Successfully created {total_beds_created} beds!")
    print("="*70 + "\n")

if __name__ == "__main__":
    try:
        create_beds_for_hospitals()
    except Exception as e:
        print(f"❌ Error: {str(e)}")
