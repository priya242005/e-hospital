from fastapi import APIRouter
from app.firebase import db

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)
@router.post("/users")
def create_user(
    user_id: str,
    name: str,
    email: str,
    role: str,
    hospital_id: str | None = None
):
    if role not in ["admin", "staff"]:
        raise HTTPException(status_code=400, detail="Role must be admin or staff")

    db.collection("users").document(user_id).set({
        "name": name,
        "email": email,
        "role": role,
        "hospital_id": hospital_id
    })

    return {"message": "User created successfully"}

# -------------------- READ ALL USERS --------------------
@router.get("/users")
def get_all_users():
    users = []
    for doc in db.collection("users").stream():
        data = doc.to_dict()
        data["user_id"] = doc.id
        users.append(data)
    return users

# -------------------- READ ONE USER --------------------
@router.get("/users/{user_id}")
def get_user(user_id: str):
    doc = db.collection("users").document(user_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    data = doc.to_dict()
    data["user_id"] = doc.id
    return data

# -------------------- UPDATE USER --------------------
@router.put("/users/{user_id}")
def update_user(
    user_id: str,
    name: str | None = None,
    email: str | None = None,
    role: str | None = None,
    hospital_id: str | None = None
):
    doc_ref = db.collection("users").document(user_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = {}
    if name is not None:
        update_data["name"] = name
    if email is not None:
        update_data["email"] = email
    if role is not None:
        update_data["role"] = role
    if hospital_id is not None:
        update_data["hospital_id"] = hospital_id

    doc_ref.update(update_data)
    return {"message": "User updated successfully"}

# -------------------- DELETE USER --------------------
@router.delete("/users/{user_id}")
def delete_user(user_id: str):
    doc_ref = db.collection("users").document(user_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")

    doc_ref.delete()
    return {"message": "User deleted successfully"}
