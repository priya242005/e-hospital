import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import AdminSidebar from "./admin/components/AdminSidebar";
import AnalyticsDashboard from "./admin/pages/AnalyticsDashboard";
import AdminDashboard from "./admin/pages/AdminDashboard";
import EmergencyMap from "./admin/pages/EmergencyMap";
import HospitalsManagement from "./admin/pages/HospitalsManagement";
import DepartmentsManagement from "./admin/pages/DepartmentsManagement";
import DoctorsManagement from "./admin/pages/DoctorsManagement";
import BedsManagement from "./admin/pages/BedsManagement";
import OPDManagement from "./admin/pages/OPDManagement";

import Login from "./patient/pages/Login";
import Register from "./patient/pages/Register";
import Home from "./patient/pages/Home";

import HospitalLogin from "./hospital/pages/HospitalLogin";
import HospitalRegister from "./hospital/pages/HospitalRegister";
import HospitalDashboard from "./hospital/pages/HospitalDashboard";
import OPDBooking from "./patient/pages/OPDBooking";
import TokenConfirmation from "./patient/pages/TokenConfirmation";
import WaitingTime from "./patient/pages/WaitingTime";
import BedAvailability from "./patient/pages/BedAvailability";
import PharmacyInfo from "./patient/pages/PharmacyInfo";
import AddPatient from "./patient/pages/AddPatient";
import MyAppointments from "./patient/pages/MyAppointments";
import AppointmentDetails from "./patient/pages/AppointmentDetails";
import AppointmentHistory from "./patient/pages/AppointmentHistory";
import ProtectedRoute from "./patient/components/ProtectedRoute";

function Layout() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-gray-100">
      
      {isAdminPage && <AdminSidebar />}

      <div className={isAdminPage ? "ml-64 p-8" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hospital/login" element={<HospitalLogin />} />
          <Route path="/hospital/register" element={<HospitalRegister />} />
          <Route path="/hospital/dashboard" element={<ProtectedRoute><HospitalDashboard /></ProtectedRoute>} />
          
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/add-patient" element={<ProtectedRoute><AddPatient /></ProtectedRoute>} />
          <Route path="/opd-booking" element={<ProtectedRoute><OPDBooking /></ProtectedRoute>} />
          <Route path="/token-confirmation" element={<ProtectedRoute><TokenConfirmation /></ProtectedRoute>} />
          <Route path="/waiting-time" element={<ProtectedRoute><WaitingTime /></ProtectedRoute>} />
          <Route path="/bed-availability" element={<ProtectedRoute><BedAvailability /></ProtectedRoute>} />
          <Route path="/pharmacy-info" element={<ProtectedRoute><PharmacyInfo /></ProtectedRoute>} />
          <Route path="/my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
          <Route path="/appointment-details" element={<ProtectedRoute><AppointmentDetails /></ProtectedRoute>} />
          <Route path="/appointment-history" element={<ProtectedRoute><AppointmentHistory /></ProtectedRoute>} />
          
          <Route path="/admin" element={<AnalyticsDashboard />} />
          <Route path="/admin/hospitals" element={<HospitalsManagement />} />
          <Route path="/admin/departments" element={<DepartmentsManagement />} />
          <Route path="/admin/doctors" element={<DoctorsManagement />} />
          <Route path="/admin/beds" element={<BedsManagement />} />
          <Route path="/admin/opd" element={<OPDManagement />} />
          <Route path="/admin/pharmacy" element={<AdminDashboard />} />
          <Route path="/admin/emergency" element={<EmergencyMap />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;