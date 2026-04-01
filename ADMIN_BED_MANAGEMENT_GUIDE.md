# Admin Portal - Bed Management Setup Guide

## 🔐 Admin Login

### Access Admin Portal
1. Go to home page: `http://localhost:3000`
2. Click on **"Admin Portal"** button (red button at bottom)
3. Or navigate directly to: `http://localhost:3000/admin/login`

### Login Credentials
- **Email**: `admin@hospital.com`
- **Password**: `password123`
- **Hospital**: Select your hospital from dropdown

---

## 📋 Bed Management Features

### 1. View All Bed Data
- Dashboard shows summary cards:
  - **Total Hospitals**: Number of hospitals with bed data
  - **General Beds**: Total general beds across all hospitals
  - **ICU Beds**: Total ICU beds across all hospitals
  - **Emergency Beds**: Total emergency beds across all hospitals

### 2. Add New Bed Data
**Steps:**
1. Click **"+ Add Bed Data"** button
2. Select hospital from dropdown
3. Enter number of beds for each type:
   - General Beds (🛏️)
   - ICU Beds (🏥)
   - Emergency Beds (🚨)
4. Click **"Add Bed Data"** button
5. Success message will appear

### 3. Edit Existing Bed Data
**Steps:**
1. Find hospital card in the grid
2. Click **"✏️ Edit"** button
3. Update bed numbers
4. Click **"Update Bed Data"** button
5. Success message will appear

### 4. View Hospital Details
Each hospital card displays:
- Hospital name
- General beds count (green)
- ICU beds count (blue)
- Emergency beds count (red)
- Total beds
- Edit button

---

## 🗄️ Database Structure

### Hospital Beds Collection
```
hospital_beds/
├── {hospital_id}
│   ├── hospital_id: string
│   ├── general_beds: number
│   ├── icu_beds: number
│   ├── emergency_beds: number
│   └── updated_at: datetime
```

---

## 🔌 API Endpoints

### Get All Bed Data
```
GET /beds
Response: Array of bed data for all hospitals
```

### Add Bed Data
```
POST /beds
Body: {
  "hospital_id": "string",
  "general_beds": number,
  "icu_beds": number,
  "emergency_beds": number
}
```

### Update Bed Data
```
PUT /beds/{hospital_id}
Body: {
  "hospital_id": "string",
  "general_beds": number,
  "icu_beds": number,
  "emergency_beds": number
}
```

### Get Bed Availability for Hospital
```
GET /beds/availability/{hospital_id}
Response: {
  "hospital_id": "string",
  "general_beds_available": number,
  "icu_beds_available": number,
  "emergency_beds_available": number,
  "total_available": number
}
```

---

## 📊 How Bed Data is Used

### Patient Side
- When booking OPD appointment, patients see real-time bed availability
- Bed availability is displayed in OPDBooking page
- Shows general, ICU, and emergency bed counts
- Patients can request bed booking if available

### Public Dashboard
- Public home page shows total available beds across all hospitals
- Bed availability overview with color indicators:
  - Green: General beds available
  - Yellow: ICU beds available
  - Red: Emergency beds available

---

## ✅ Workflow Example

### Step 1: Hospital Admin Logs In
- Navigate to `/admin/login`
- Select hospital: "City Hospital"
- Enter credentials
- Click "Login as Admin"

### Step 2: Add Bed Data
- Click "+ Add Bed Data"
- Select "City Hospital"
- Enter:
  - General Beds: 50
  - ICU Beds: 20
  - Emergency Beds: 10
- Click "Add Bed Data"
- Success! Data saved to database

### Step 3: Patient Books Appointment
- Patient goes to OPD booking
- Selects "City Hospital"
- Sees bed availability: 50 general, 20 ICU, 10 emergency
- Can request bed if needed
- Books appointment

### Step 4: Update Bed Data
- Admin sees bed data card for "City Hospital"
- Clicks "Edit"
- Updates: General Beds: 48 (2 occupied)
- Clicks "Update Bed Data"
- Changes reflected immediately

---

## 🔄 Real-Time Updates

- Bed data updates are immediate
- Patient side reflects changes within seconds
- Public dashboard updates automatically
- No page refresh needed

---

## 🚀 Future Enhancements

1. **Bed Occupancy Tracking**
   - Track which beds are occupied
   - Automatic updates when patients are admitted/discharged

2. **Bed Assignment**
   - Assign specific beds to patients
   - Track bed history

3. **Alerts & Notifications**
   - Alert when beds are full
   - Notify when beds become available

4. **Analytics**
   - Occupancy rate charts
   - Bed utilization reports
   - Peak hours analysis

5. **Multi-Hospital Management**
   - Super admin can manage all hospitals
   - Hospital-specific admins manage their hospital only

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify hospital is selected in login
3. Ensure backend server is running on port 8000
4. Check Firebase connection

---

## 🔒 Security Notes

- Admin credentials are stored in localStorage
- Use strong passwords in production
- Implement JWT authentication for production
- Add role-based access control (RBAC)
- Audit logs for bed data changes

---

**Last Updated**: 2024
**Version**: 1.0
