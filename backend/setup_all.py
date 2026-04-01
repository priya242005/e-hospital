"""
Master setup script to seed all hospital data
Run this script to set up complete hospital infrastructure
"""

import subprocess
import sys
import os

def run_script(script_name, description):
    """Run a seed script and handle errors"""
    print(f"\n{'='*70}")
    print(f"🚀 {description}")
    print(f"{'='*70}\n")
    
    try:
        result = subprocess.run([sys.executable, script_name], cwd='backend', capture_output=False)
        if result.returncode == 0:
            print(f"✅ {description} completed successfully!\n")
            return True
        else:
            print(f"❌ {description} failed!\n")
            return False
    except Exception as e:
        print(f"❌ Error running {script_name}: {str(e)}\n")
        return False

def main():
    """Run all setup scripts in order"""
    
    print("\n" + "="*70)
    print("🏥 SMART E-HOSPITAL SETUP")
    print("="*70)
    print("\nThis script will set up your hospital infrastructure:")
    print("1. Create hospital admin credentials")
    print("2. Create departments for each hospital")
    print("3. Create sample doctors")
    print("4. Create sample beds")
    print("\n" + "="*70 + "\n")
    
    # Check if we're in the right directory
    if not os.path.exists('backend'):
        print("❌ Error: Please run this script from the project root directory")
        print("   Current directory:", os.getcwd())
        sys.exit(1)
    
    scripts = [
        ("seed_hospital_credentials.py", "Step 1: Creating Hospital Admin Credentials"),
        ("seed_departments.py", "Step 2: Creating Departments"),
        ("seed_doctors.py", "Step 3: Creating Sample Doctors"),
        ("seed_beds.py", "Step 4: Creating Sample Beds"),
    ]
    
    results = []
    for script, description in scripts:
        success = run_script(script, description)
        results.append((description, success))
    
    # Print summary
    print("\n" + "="*70)
    print("📊 SETUP SUMMARY")
    print("="*70 + "\n")
    
    all_success = True
    for description, success in results:
        status = "✅ COMPLETED" if success else "❌ FAILED"
        print(f"{status}: {description}")
        if not success:
            all_success = False
    
    print("\n" + "="*70)
    
    if all_success:
        print("\n🎉 All setup steps completed successfully!")
        print("\n📋 Next Steps:")
        print("1. Check backend/HOSPITAL_ADMIN_CREDENTIALS.txt for login credentials")
        print("2. Start your backend server: uvicorn app.main:app --reload")
        print("3. Start your frontend: npm start")
        print("4. Go to http://localhost:3000/admin/login")
        print("5. Login with hospital admin credentials")
        print("6. Access your hospital dashboard")
        print("\n" + "="*70 + "\n")
    else:
        print("\n⚠️  Some setup steps failed. Please check the errors above.")
        print("   Make sure:")
        print("   - Firebase credentials file exists")
        print("   - Hospitals are created in the database")
        print("   - All dependencies are installed")
        print("\n" + "="*70 + "\n")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        sys.exit(1)
