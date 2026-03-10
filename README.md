# 🏥 Smart e-Hospital Management System

A comprehensive healthcare management platform with real-time monitoring, patient portals, hospital operations, and pharmacy management.

## 🌟 Features

### Public Healthcare Dashboard
- Real-time system statistics
- Hospital status monitoring with color indicators
- Live bed availability tracking
- OPD waiting time display
- Pharmacy stock alerts
- Nearby hospital finder

### Patient Portal
- OPD appointment booking
- Family member management
- Real-time token tracking
- Appointment history
- Waiting time estimates

### Hospital Dashboard
- Hospital overview analytics
- Doctor workload monitoring with charts
- OPD queue management
- Bed management with visual indicators
- Emergency case tracking
- Real-time statistics

### Pharmacy Dashboard
- Prescription queue management
- Inventory tracking with alerts
- Medicine demand analytics
- Stock level monitoring
- Expiry date tracking

### Admin Dashboard (Coming Soon)
- City-level hospital monitoring
- System-wide analytics
- Master data management
- Alert broadcasting

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: Firebase Firestore
- **Authentication**: JWT with bcrypt
- **Language**: Python 3.8+

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- Firebase project with Firestore enabled
- npm or yarn

## 🚀 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd e-hospital
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn firebase-admin python-jose passlib bcrypt

# Configure Firebase
# Place your firebase credentials JSON file in backend/
# Update firebase.py with your credentials path
```

### 3. Frontend Setup

```bash
cd frontend/e-hospital-dashboard

# Install dependencies
npm install

# Install Recharts for charts
npm install recharts
```

## ⚙️ Configuration

### Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Download service account credentials JSON
4. Place in `backend/` directory
5. Update `backend/app/firebase.py` with credentials path

### Environment Variables
Create `.env` file in backend directory:
```env
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

## 🏃 Running the Application

### Start Backend Server
```bash
cd backend
uvicorn app.main:app --reload
```
Backend runs on: http://localhost:8000
API Docs: http://localhost:8000/docs

### Start Frontend Server
```bash
cd frontend/e-hospital-dashboard
npm start
```
Frontend runs on: http://localhost:3000

### Create Test Users
```bash
cd backend
python seed_test_users.py
```

## 👥 Test Credentials

After running seed script:

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@test.com | password123 |
| Hospital Admin | hospital@test.com | password123 |
| Pharmacy Admin | pharmacy@test.com | password123 |
| Super Admin | admin@test.com | password123 |

## 📱 User Flows

### Patient Flow
1. Visit http://localhost:3000
2. Click "Patient Login"
3. Login or Register
4. Book OPD appointment
5. Track token and waiting time

### Hospital Admin Flow
1. Visit http://localhost:3000
2. Click "Hospital Staff Login"
3. Register hospital (includes geolocation)
4. Login with credentials
5. Access hospital dashboard
6. Manage OPD queue, beds, and operations

### Pharmacy Admin Flow
1. Visit http://localhost:3000
2. Click "Pharmacy Login"
3. Login with credentials
4. Manage prescription queue
5. Track inventory and stock levels
6. View demand analytics

## 🗂️ Project Structure

```
e-hospital/
├── backend/
│   ├── app/
│   │   ├── routes/          # API endpoints
│   │   ├── models/          # Pydantic schemas
│   │   ├── auth_utils.py    # JWT authentication
│   │   ├── firebase.py      # Firebase config
│   │   └── main.py          # FastAPI app
│   └── seed_test_users.py   # Test data script
├── frontend/
│   └── e-hospital-dashboard/
│       └── src/
│           ├── public/      # Public dashboard
│           ├── patient/     # Patient portal
│           ├── hospital/    # Hospital dashboard
│           ├── pharmacy/    # Pharmacy dashboard
│           ├── admin/       # Admin dashboard
│           └── ui/          # Reusable components
├── IMPLEMENTATION_SUMMARY.md
├── TROUBLESHOOTING.md
└── README.md
```

## 🔐 Security Features

- JWT token-based authentication
- Bcrypt password hashing
- Role-based access control (RBAC)
- Protected API endpoints
- Secure token storage

## 🎨 UI/UX Features

- Professional healthcare theme (#0b1f3a)
- Color-coded status indicators
- Responsive design (mobile/tablet/desktop)
- Interactive charts and analytics
- Real-time data updates
- Loading states and error handling

## 📊 Database Collections

1. **users** - User authentication and roles
2. **hospitals** - Hospital information
3. **doctors** - Doctor records
4. **bed_management** - Individual bed tracking
5. **opd_queue** - OPD queue management
6. **pharmacy_inventory** - Medicine stock
7. **pharmacy_queue** - Prescription queue
8. **notifications** - Alert system
9. **master_departments** - Department master data
10. **hospital_departments** - Hospital-department mapping

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.

## 📈 API Documentation

Access interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔄 Development Status

- ✅ Public Healthcare Dashboard
- ✅ Patient Portal
- ✅ Hospital Dashboard with Charts
- ✅ Pharmacy Dashboard
- ✅ JWT Authentication
- ⏳ Admin Dashboard (In Progress)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Authors

Smart e-Hospital Development Team

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- Firebase for real-time database
- Recharts for beautiful charts
- Tailwind CSS for styling

## 📞 Support

For issues and questions:
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Open an issue on GitHub
- Contact development team

---

**Built with ❤️ for better healthcare management**
