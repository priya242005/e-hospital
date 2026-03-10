import sys
import subprocess

print("sys.executable:", sys.executable)
try:
    import jose
    print("jose imported successfully")
except ImportError as e:
    print("jose import failed:", e)

try:
    from passlib.context import CryptContext
    print("passlib imported successfully")
except ImportError as e:
    print("passlib import failed:", e)
