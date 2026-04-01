# 🔧 Admin Dashboard Real-Time Data Fetching - Troubleshooting Guide

## ✅ What Was Fixed

### 1. **API Service (`adminApi.js`)**
- ✅ Added proper axios interceptor for JWT token authentication
- ✅ Created dedicated service methods for all endpoints
- ✅ Mapped frontend calls to correct backend endpoints
- ✅ Added error handling and token management

### 2. **Analytics Dashboard (`AnalyticsDashboard.jsx`)**
- ✅ Updated to use correct public endpoints (no auth required for overview)
- ✅ Added proper error handling with user feedback
- ✅ Implemented auto-refresh every 30 seconds
- ✅ Added loading states and retry functionality
- ✅ Improved UI with real-time data display

---

## 🔌 API Endpoints Used

### Public Endpoints (No Authentication Required)
```
GET /public/healthcare-overview      # System-wide statistics
GET /public/hospital-status          # Hospital status with color indicators
GET /public/bed-availability         # Bed availability by type
GET /public/opd-waiting-times        # OPD waiting times by department
GET /public/pharmacy-alerts          # Low stock alerts
GET /public/nearby-hospitals         # Nearby hospital finder
```

### Protected Endpoints (Requires JWT Token)
```
GET /beds                            # All bed data
GET /beds/{hospital_id}              # Bed availability for hospital
GET /beds/individual/{hospital_id}   # Individual bed records
GET /hospitals                       # All hospitals
GET /doctors                         # All doctors
GET /opd/queue/{hospital_id}         # OPD queue for hospital
GET /appointments                    # All appointments
```

---

## 🚀 How to Test Real-Time Data Fetching

### Step 1: Start Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Step 2: Start Frontend
```bash
cd frontend/e-hospital-dashboard
npm install
npm start
```

### Step 3: Test Public Endpoints (No Login Required)
Open browser console and test:
```javascript
// Test healthcare overview
fetch('http://localhost:8000/public/healthcare-overview')
  .then(r => r.json())
  .then(d => console.log(d))

// Test hospital status
fetch('http://localhost:8000/public/hospital-status')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Step 4: Access Admin Dashboard
1. Go to http://localhost:3000/admin/login
2. Login with: `admin@test.com` / `password123`
3. You'll be redirected to `/admin` (AnalyticsDashboard)
4. Data should load automatically

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch analytics data"
**Cause:** Backend not running or endpoints not available

**Solution:**
```bash
# Check if backend is running
curl http://localhost:8000/docs

# If not, start backend
cd backend
uvicorn app.main:app --reload
```

### Issue 2: "CORS error" in browser console
**Cause:** Frontend and backend not properly configured

**Solution:**
- Backend CORS is already configured in `app/main.py`
- Ensure frontend is on `http://localhost:3000`
- Check browser console for exact error

### Issue 3: Data shows "No data available"
**Cause:** No test data in Firebase

**Solution:**
```bash
# Create test data
cd backend
python seed_test_users.py
python seed_hospital_admins.py
```

### Issue 4: "Could not validate credentials" error
**Cause:** JWT token expired or invalid

**Solution:**
- Clear localStorage: `localStorage.clear()`
- Login again
- Token is stored as `token` in localStorage

### Issue 5: Real-time data not updating
**Cause:** Auto-refresh interval not working

**Solution:**
- Check browser console for errors
- Click "🔄 Refresh" button manually
- Verify network tab shows successful requests

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│         AnalyticsDashboard.jsx (Frontend)                   │
│  ├─ useEffect: Fetch on mount + 30s interval               │
│  └─ fetchAllData() calls 4 endpoints in parallel            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         adminApiService (API Layer)                         │
│  ├─ Adds JWT token to Authorization header                 │
│  ├─ Handles request/response interceptors                  │
│  └─ Maps to backend endpoints                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         Backend FastAPI Routes                              │
│  ├─ /public/healthcare-overview (public.py)                │
│  ├─ /public/hospital-status (public.py)                    │
│  ├─ /public/bed-availability (public.py)                   │
│  └─ /public/opd-waiting-times (public.py)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         Firebase Firestore (Database)                       │
│  ├─ hospitals collection                                    │
│  ├─ bed_management collection                               │
│  ├─ opd_queue collection                                    │
│  ├─ master_departments collection                           │
│  └─ hospital_departments collection                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Real-Time Update Mechanism

### Current Implementation:
```javascript
useEffect(() => {
  fetchAllData();  // Fetch on component mount
  
  // Auto-refresh every 30 seconds
  const interval = setInterval(fetchAllData, 30000);
  
  // Cleanup interval on unmount
  return () => clearInterval(interval);
}, []);
```

### To Make It Truly Real-Time (Optional Enhancement):
```javascript
// Use Firebase Realtime Listeners instead of polling
useEffect(() => {
  const unsubscribe = db.collection("opd_queue")
    .where("opd_date", "==", today)
    .onSnapshot((snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setOpdWaitingTimes(data);
    });
  
  return () => unsubscribe();
}, []);
```

---

## 📋 Checklist for Debugging

- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Firebase credentials file exists (`backend/firebase-key.json`)
- [ ] Test data created (`python seed_test_users.py`)
- [ ] Admin user exists (`admin@test.com`)
- [ ] JWT token stored in localStorage after login
- [ ] Network tab shows successful API calls (200 status)
- [ ] No CORS errors in browser console
- [ ] Data appears in Firebase Firestore collections

---

## 🧪 Manual Testing Commands

### Test Healthcare Overview
```bash
curl http://localhost:8000/public/healthcare-overview
```

### Test Hospital Status
```bash
curl http://localhost:8000/public/hospital-status
```

### Test Bed Availability
```bash
curl http://localhost:8000/public/bed-availability
```

### Test OPD Waiting Times
```bash
curl http://localhost:8000/public/opd-waiting-times
```

### Test with Authentication
```bash
# Get token first
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Use token in request
curl http://localhost:8000/admin/analytics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📈 Performance Optimization Tips

1. **Reduce Refresh Interval** (if needed):
   ```javascript
   const interval = setInterval(fetchAllData, 10000); // 10 seconds
   ```

2. **Add Caching**:
   ```javascript
   const [cache, setCache] = useState({});
   const [lastFetch, setLastFetch] = useState(0);
   
   if (Date.now() - lastFetch < 5000) {
     return cache; // Use cached data
   }
   ```

3. **Pagination for Large Datasets**:
   ```javascript
   const [page, setPage] = useState(1);
   const itemsPerPage = 10;
   ```

4. **Lazy Load Components**:
   ```javascript
   const HospitalStatus = lazy(() => import('./HospitalStatus'));
   ```

---

## 🔐 Security Notes

- JWT tokens expire after 24 hours
- Tokens stored in localStorage (consider using httpOnly cookies for production)
- Public endpoints don't require authentication
- Protected endpoints check user role before returning data
- Never expose Firebase credentials in frontend code

---

## 📞 Quick Reference

| Component | File | Purpose |
|-----------|------|---------|
| Dashboard | `AnalyticsDashboard.jsx` | Main analytics UI |
| API Service | `adminApi.js` | API calls & auth |
| Backend Routes | `routes/public.py` | Public endpoints |
| Backend Routes | `routes/admin.py` | Admin endpoints |
| Auth Utils | `auth_utils.py` | JWT & RBAC |

---

## ✨ Next Steps

1. **Test the dashboard** - Verify all data loads correctly
2. **Monitor network tab** - Check API response times
3. **Add more visualizations** - Use Recharts for charts
4. **Implement WebSockets** - For true real-time updates
5. **Add data export** - CSV/PDF export functionality

---

**Dashboard is now ready for real-time data fetching! 🎉**
