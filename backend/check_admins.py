import firebase_admin
from firebase_admin import credentials, firestore

try:
    cred = credentials.Certificate('e-hospital-firebase-key.json')
    firebase_admin.initialize_app(cred)
except:
    print("❌ Firebase credentials file not found!")
    exit(1)

db = firestore.client()

print("=== ALL hospital_admin users ===")
admins = db.collection("users").where("role", "==", "hospital_admin").stream()
admin_list = list(admins)
for doc in admins:
    d = doc.to_dict()
    print(f"doc_id: {doc.id} | email: {d.get('email')} | hospital_id: {d.get('hospital_id')}")

if not admin_list:
    print("None found.")

print(f"\nTotal: {len(admin_list)}")
