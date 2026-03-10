import sys
import traceback

with open("out_debug.txt", "w") as f:
    try:
        from app.routes.auth import register, UserRegister
        
        user = UserRegister(
            name="Test User",
            email="test-error@example.com",
            phone="1234567890",
            password="password123"
        )
        
        f.write("Attempting register...\n")
        result = register(user)
        f.write(f"Success: {result}\n")
    except Exception as e:
        f.write("Exception:\n")
        traceback.print_exc(file=f)
