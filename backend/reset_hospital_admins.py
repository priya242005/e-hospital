import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('firebase-key.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

admins = list(db.collection("users").where("role", "==", "hospital_admin").stream())
deleted = 0
for doc in admins:
    print(f"Deleting: {doc.to_dict().get('email')}")
    db.collection("users").document(doc.id).delete()
    deleted += 1

print(f"\nDeleted {deleted} hospital_admin users.")
