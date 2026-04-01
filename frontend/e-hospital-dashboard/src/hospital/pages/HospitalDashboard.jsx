import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HospitalDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [opdQueue, setOpdQueue] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [user, setUser] = useState(null);
  const [hospitalId, setHospitalId] = useState(null);
  const [hospitalName, setHospitalName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  const [showBedModal, setShowBedModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [pharmacyStaff, setPharmacyStaff] = useState([]);
  const [bedTypeFilter, setBedTypeFilter] = useState('all');
  const [selectedBed, setSelectedBed] = useState(null);
  const [showPatientSelectModal, setShowPatientSelectModal] = useState(false);
  const [patientsNeedingBeds, setPatientsNeedingBeds] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reservedBeds, setReservedBeds] = useState([]);
  const [occupiedBeds, setOccupiedBeds] = useState([]);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [dischargeTarget, setDischargeTarget] = useState(null);
  const [dischargeNote, setDischargeNote] = useState('');
  const [pharmacyAlerts, setPharmacyAlerts] = useState([]);
  
  const [doctorForm, setDoctorForm] = useState({ name: '', department_id: '', specialization: '', contact_number: '', email: '', password: '' });
  const [pharmacyForm, setPharmacyForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [bedForm, setBedForm] = useState({ ward_name: '', ward_number: '', total_beds: '', bed_type: 'general' });
  const [departmentForm, setDepartmentForm] = useState({ department_name: '', description: '' });
  
  // Walk-in booking form
  const [walkInForm, setWalkInForm] = useState({
    name: '', age: '', gender: 'male', phone: '', department_id: '', doctor_id: '', priority: 'normal', appointment_date: new Date().toISOString().split('T')[0]
  });

  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.user_id || userData.role !== 'hospital_admin') {
      navigate('/hospital/login');
      return;
    }
    setUser(userData);
    fetchHospitalData(userData.user_id);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchHospitalData(userData.user_id);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchHospitalData = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const hospitalRes = await axios.get(`http://localhost:8000/hospitals/by-user/${userId}`, { headers });
      const hId = hospitalRes.data.hospital_id;
      setHospitalId(hId);
      setHospitalName(hospitalRes.data.hospital_name);

      const [dashboardRes, bedsRes, queueRes, doctorsRes, deptsRes] = await Promise.all([
        axios.get(`http://localhost:8000/hospitals/${hId}/dashboard`, { headers }),
        axios.get(`http://localhost:8000/beds?hospital_id=${hId}`, { headers }),
        axios.get(`http://localhost:8000/opd/queue/${hId}`, { headers }),
        axios.get(`http://localhost:8000/doctors?hospital_id=${hId}`, { headers }),
        axios.get(`http://localhost:8000/departments?hospital_id=${hId}`, { headers })
      ]);

      setStats(dashboardRes.data);
      setBeds(bedsRes.data || []);
      setOpdQueue(queueRes.data || []);
      setDoctors(doctorsRes.data || []);
      setDepartments(deptsRes.data || []);

      const reservedRes = await axios.get(`http://localhost:8000/beds/reserved/${hId}`, { headers });
      setReservedBeds(reservedRes.data || []);

      const occupiedRes = await axios.get(`http://localhost:8000/beds/occupied/${hId}`, { headers });
      setOccupiedBeds(occupiedRes.data || []);

      // Fetch pharmacy alerts — computed live from pharmacy_inventory for this hospital
      try {
        const alertRes = await axios.get(`http://localhost:8000/pharmacy/alerts/${hId}`);
        setPharmacyAlerts(alertRes.data || []);
      } catch (_e) { setPharmacyAlerts([]); }

      // Fetch pharmacy staff - filter by role
      const usersRes = await axios.get(`http://localhost:8000/auth/users`, { headers });
      const pharmacyUsers = (usersRes.data || []).filter(u => u.role === 'pharmacy_admin' && u.hospital_id === hId);
      setPharmacyStaff(pharmacyUsers);
    } catch (error) {
      console.error('Failed to fetch hospital data');
    }
  };

  const handleWalkInBooking = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/appointments/walk-in', {
        hospital_id: hospitalId,
        patient_name: walkInForm.name,
        age: parseInt(walkInForm.age),
        gender: walkInForm.gender,
        contact_number: walkInForm.phone,
        department_id: walkInForm.department_id,
        doctor_id: walkInForm.doctor_id || null,
        priority: walkInForm.priority,
        appointment_date: walkInForm.appointment_date
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert(`Appointment booked! Token: ${response.data.token_id}`);
      setWalkInForm({ name: '', age: '', gender: 'male', phone: '', department_id: '', doctor_id: '', priority: 'normal', appointment_date: new Date().toISOString().split('T')[0] });
      fetchHospitalData(user.user_id);
      setActiveTab('appointments');
    } catch (error) {
      alert('Failed to book appointment');
    }
  };

  const handleCompleteConsultation = async (tokenId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/opd/${tokenId}`, { status: 'completed' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHospitalData(user.user_id);
    } catch (error) {
      alert('Failed to complete consultation');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/hospital/login');
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!doctorForm.email || !doctorForm.password) {
      alert('Email and password are required for doctor login credentials');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/doctors', {
        name: doctorForm.name,
        department_id: doctorForm.department_id,
        specialization: doctorForm.specialization,
        contact_number: doctorForm.contact_number,
        email: doctorForm.email,
        password: doctorForm.password,
        hospital_id: hospitalId,
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Doctor added! Login: ${doctorForm.email} / ${doctorForm.password}`);
      setShowDoctorModal(false);
      setDoctorForm({ name: '', department_id: '', specialization: '', contact_number: '', email: '', password: '' });
      fetchHospitalData(user.user_id);
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to add doctor');
    }
  };

  const handleAddPharmacyStaff = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/auth/register', {
        name: pharmacyForm.name,
        email: pharmacyForm.email,
        password: pharmacyForm.password,
        phone: pharmacyForm.phone || '',
        role: 'pharmacy_admin',
        hospital_id: hospitalId
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Pharmacy staff created successfully');
      setShowPharmacyModal(false);
      setPharmacyForm({ name: '', email: '', password: '', phone: '' });
      fetchHospitalData(user.user_id);
    } catch (error) {
      console.error('Pharmacy staff creation error:', error.response?.data);
      alert(`Failed to create pharmacy staff: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleAddBed = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const totalBeds = parseInt(bedForm.total_beds);
      
      // Create multiple beds for the ward
      for (let i = 1; i <= totalBeds; i++) {
        await axios.post('http://localhost:8000/beds', {
          hospital_id: hospitalId,
          ward_name: bedForm.ward_name,
          ward_number: bedForm.ward_number,
          bed_number: `${bedForm.ward_number}-${i}`,
          bed_type: bedForm.bed_type,
          status: 'available'
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      
      alert(`${totalBeds} beds added successfully to ${bedForm.ward_name}`);
      setShowBedModal(false);
      setBedForm({ ward_name: '', ward_number: '', total_beds: '', bed_type: 'general' });
      fetchHospitalData(user.user_id);
    } catch (error) {
      alert('Failed to add beds');
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/departments', {
        hospital_id: hospitalId,
        department_name: departmentForm.department_name,
        description: departmentForm.description
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Department added successfully');
      setShowDepartmentModal(false);
      setDepartmentForm({ department_name: '', description: '' });
      fetchHospitalData(user.user_id);
    } catch (error) {
      alert('Failed to add department');
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/departments/${deptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Department deleted successfully');
      fetchHospitalData(user.user_id);
    } catch (error) {
      alert('Failed to delete department');
    }
  };

  const handleBedClick = (bed) => {
    if (bed.status !== 'available') return;
    setSelectedBed(bed);
    setShowPatientSelectModal(true);
    fetchPatientsNeedingBeds();
  };

  const fetchPatientsNeedingBeds = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/opd/queue/${hospitalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatientsNeedingBeds(response.data || []);
    } catch (error) {
      console.error('Failed to fetch patients');
    }
  };

  const handleBookBed = async () => {
    if (!selectedBed || !selectedPatient) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/beds/${selectedBed.bed_id}?status=occupied&patient_id=${selectedPatient.patient_id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Bed ${selectedBed.bed_number} assigned to ${selectedPatient.patient_name}`);
      setSelectedBed(null);
      setSelectedPatient(null);
      setShowPatientSelectModal(false);
      fetchHospitalData(user.user_id);
    } catch (error) {
      alert('Failed to book bed');
    }
  };

  const handleConfirmBed = async (bedId, patientId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/beds/${bedId}?status=occupied&patient_id=${patientId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHospitalData(user.user_id);
    } catch (error) {
      alert('Failed to confirm bed');
    }
  };

  const handleRejectBed = async (bedId) => {
    if (!window.confirm('Reject this bed request? The bed will be released back to available.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/beds/${bedId}?status=available`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHospitalData(user.user_id);
    } catch (error) {
      alert('Failed to reject bed request');
    }
  };

  const handleDischargeBed = async () => {
    if (!dischargeTarget) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/beds/${dischargeTarget.bed_id}?status=available&discharge_note=${encodeURIComponent(dischargeNote)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowDischargeModal(false);
      setDischargeTarget(null);
      setDischargeNote('');
      fetchHospitalData(user.user_id);
    } catch (error) {
      alert('Failed to discharge patient');
    }
  };

  const filteredBeds = bedTypeFilter === 'all' ? beds : beds.filter(b => b.bed_type === bedTypeFilter);
  const sortedBeds = [...filteredBeds].sort((a, b) => {
    if (a.status === 'available' && b.status !== 'available') return -1;
    if (a.status !== 'available' && b.status === 'available') return 1;
    return 0;
  });

  if (!stats) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-xl">Loading...</div></div>;
  }

  const overview = stats.overview || {};

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-[#0b1f3a] text-white ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-blue-800">
          <h2 className={`font-bold ${sidebarOpen ? 'text-lg' : 'text-xs text-center'}`}>{sidebarOpen ? hospitalName : 'H'}</h2>
        </div>
        <nav className="flex-1 py-4">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'appointments', icon: '📋', label: 'Appointments' },
            { id: 'book', icon: '➕', label: 'Book Appointment' },
            { id: 'departments', icon: '🏢', label: 'Departments' },
            { id: 'doctors', icon: '👨‍⚕️', label: 'Doctors' },
            { id: 'beds', icon: '🛏️', label: 'Beds' },
            { id: 'bed-requests', icon: '📥', label: `Bed Requests${reservedBeds.length ? ` (${reservedBeds.length})` : ''}` },
            { id: 'occupied-beds', icon: '👥', label: `Occupied Beds${occupiedBeds.length ? ` (${occupiedBeds.length})` : ''}` },
            { id: 'pharmacy-staff', icon: '👨‍👩‍👧‍👦', label: 'Pharmacy Staff' },
            { id: 'pharmacy', icon: '💊', label: 'Pharmacy' },
            { id: 'alerts', icon: '🔔', label: `Alerts${pharmacyAlerts.length ? ` (${pharmacyAlerts.length})` : ''}` }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full px-4 py-3 text-left hover:bg-blue-900 transition ${activeTab === item.id ? 'bg-blue-900 border-l-4 border-white' : ''}`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-4 border-t border-blue-800 hover:bg-blue-900">
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#0b1f3a]">{hospitalName}</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name || 'Admin'} • <span className="text-green-600">● Live</span></p>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={() => fetchHospitalData(user.user_id)} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 font-semibold text-sm">
              🔄 Refresh
            </button>
            <button onClick={handleLogout} className="bg-[#0b1f3a] text-white px-6 py-2 rounded-lg hover:bg-blue-900">Logout</button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Hospital Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-gray-600 text-sm">Today's OPD</p>
                  <p className="text-3xl font-bold text-blue-600">{overview.today_opd_patients || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-3xl mb-2">👨‍⚕️</div>
                  <p className="text-gray-600 text-sm">Active Doctors</p>
                  <p className="text-3xl font-bold text-green-600">{overview.active_doctors || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-3xl mb-2">🛏️</div>
                  <p className="text-gray-600 text-sm">Available Beds</p>
                  <p className="text-3xl font-bold text-purple-600">{overview.available_beds || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-3xl mb-2">🚨</div>
                  <p className="text-gray-600 text-sm">Emergency Cases</p>
                  <p className="text-3xl font-bold text-red-600">{stats.opd_analytics?.emergency_cases || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-3xl mb-2">⏱️</div>
                  <p className="text-gray-600 text-sm">Wait Time (min)</p>
                  <p className="text-3xl font-bold text-yellow-600">{overview.current_waiting_time || 0}</p>
                </div>
              </div>

              {/* Doctor Load Monitoring */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">Doctor Load Monitoring</h3>
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm">Doctor</th>
                      <th className="px-4 py-2 text-left text-sm">Department</th>
                      <th className="px-4 py-2 text-left text-sm">Current Load</th>
                      <th className="px-4 py-2 text-left text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.doctor_loads?.map((d, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2 text-sm">{d.name}</td>
                        <td className="px-4 py-2 text-sm">{d.department || 'N/A'}</td>
                        <td className="px-4 py-2 text-sm">{d.current_load}/{d.max_load}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            d.status === 'normal' ? 'bg-green-100 text-green-700' :
                            d.status === 'busy' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{d.status.toUpperCase()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">OPD Queue Management</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0b1f3a] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm">Token</th>
                      <th className="px-4 py-3 text-left text-sm">Patient</th>
                      <th className="px-4 py-3 text-left text-sm">Doctor</th>
                      <th className="px-4 py-3 text-left text-sm">Priority</th>
                      <th className="px-4 py-3 text-left text-sm">Status</th>
                      <th className="px-4 py-3 text-left text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opdQueue.filter(q => q.status === 'waiting').map((q) => (
                      <tr key={q.token_id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-bold">{q.token_id}</td>
                        <td className="px-4 py-3 text-sm">{q.patient_name || 'Patient'}</td>
                        <td className="px-4 py-3 text-sm">{q.doctor_name || 'Doctor'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            q.priority === 'emergency' ? 'bg-red-100 text-red-700' :
                            q.priority === 'elder' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{q.priority.toUpperCase()}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">{q.status}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleCompleteConsultation(q.token_id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Complete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Book Appointment Tab */}
          {activeTab === 'book' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Walk-In Patient Registration</h2>
              <form onSubmit={handleWalkInBooking} className="bg-white rounded-lg shadow p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Patient Name</label>
                    <input type="text" required value={walkInForm.name} onChange={(e) => setWalkInForm({...walkInForm, name: e.target.value})} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Age</label>
                    <input type="number" required value={walkInForm.age} onChange={(e) => setWalkInForm({...walkInForm, age: e.target.value})} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Gender</label>
                    <select value={walkInForm.gender} onChange={(e) => setWalkInForm({...walkInForm, gender: e.target.value})} className="w-full border rounded px-3 py-2">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Phone Number</label>
                    <input type="tel" required value={walkInForm.phone} onChange={(e) => setWalkInForm({...walkInForm, phone: e.target.value})} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Department</label>
                  <select required value={walkInForm.department_id} onChange={(e) => setWalkInForm({...walkInForm, department_id: e.target.value, doctor_id: ''})} className="w-full border rounded px-3 py-2">
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Doctor (Optional - Auto-assign if empty)</label>
                  <select value={walkInForm.doctor_id} onChange={(e) => setWalkInForm({...walkInForm, doctor_id: e.target.value})} className="w-full border rounded px-3 py-2">
                    <option value="">Auto-assign</option>
                    {doctors.filter(d => d.department_id === walkInForm.department_id).map(d => <option key={d.doctor_id} value={d.doctor_id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Priority</label>
                    <select value={walkInForm.priority} onChange={(e) => setWalkInForm({...walkInForm, priority: e.target.value})} className="w-full border rounded px-3 py-2">
                      <option value="normal">Normal</option>
                      <option value="elder">Elder</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Appointment Date</label>
                    <input type="date" required value={walkInForm.appointment_date} onChange={(e) => setWalkInForm({...walkInForm, appointment_date: e.target.value})} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#0b1f3a] text-white py-3 rounded-lg hover:bg-blue-900 font-semibold">Book Appointment</button>
              </form>
            </div>
          )}

          {/* Departments Tab */}
          {activeTab === 'departments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Department Management</h2>
                <button onClick={() => setShowDepartmentModal(true)} className="bg-[#0b1f3a] text-white px-6 py-2 rounded-lg hover:bg-blue-900">+ Add Department</button>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0b1f3a] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm">Department Name</th>
                      <th className="px-4 py-3 text-left text-sm">Description</th>
                      <th className="px-4 py-3 text-left text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((d) => (
                      <tr key={d.department_id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold">{d.department_name}</td>
                        <td className="px-4 py-3 text-sm">{d.description || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteDepartment(d.department_id)} className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Doctors Tab */}
          {activeTab === 'doctors' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Doctor Management</h2>
                <button onClick={() => setShowDoctorModal(true)} className="bg-[#0b1f3a] text-white px-6 py-2 rounded-lg hover:bg-blue-900">+ Add Doctor</button>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0b1f3a] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm">Name</th>
                      <th className="px-4 py-3 text-left text-sm">Specialization</th>
                      <th className="px-4 py-3 text-left text-sm">Contact</th>
                      <th className="px-4 py-3 text-left text-sm">Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((d) => (
                      <tr key={d.doctor_id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold">{d.name}</td>
                        <td className="px-4 py-3 text-sm">{d.specialization}</td>
                        <td className="px-4 py-3 text-sm">{d.contact_number || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${d.availability === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {d.availability.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Beds Tab */}
          {activeTab === 'beds' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Bed Management</h2>
                <button onClick={() => setShowBedModal(true)} className="bg-[#0b1f3a] text-white px-6 py-2 rounded-lg hover:bg-blue-900">+ Add Ward & Beds</button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Beds', value: beds.length, color: 'bg-[#0b1f3a] text-white' },
                  { label: 'Available', value: beds.filter(b => b.status === 'available').length, color: 'bg-green-600 text-white' },
                  { label: 'Occupied', value: beds.filter(b => b.status === 'occupied').length, color: 'bg-red-500 text-white' },
                  { label: 'Reserved', value: beds.filter(b => b.status === 'reserved').length, color: 'bg-yellow-500 text-white' },
                ].map(s => (
                  <div key={s.label} className={`${s.color} rounded-xl p-4 text-center shadow`}>
                    <p className="text-3xl font-bold">{s.value}</p>
                    <p className="text-sm mt-1 opacity-90">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Bed Type Filter */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All', count: beds.length, active: 'bg-[#0b1f3a] text-white', inactive: 'bg-gray-100 text-gray-700' },
                  { key: 'general', label: 'General', count: beds.filter(b => b.bed_type === 'general').length, active: 'bg-blue-600 text-white', inactive: 'bg-blue-50 text-blue-700' },
                  { key: 'icu', label: 'ICU', count: beds.filter(b => b.bed_type === 'icu').length, active: 'bg-orange-500 text-white', inactive: 'bg-orange-50 text-orange-700' },
                  { key: 'emergency', label: 'Emergency', count: beds.filter(b => b.bed_type === 'emergency').length, active: 'bg-red-600 text-white', inactive: 'bg-red-50 text-red-700' },
                ].map(f => (
                  <button key={f.key} onClick={() => setBedTypeFilter(f.key)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${bedTypeFilter === f.key ? f.active : f.inactive}`}>
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>

              {/* Bed Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {sortedBeds.map((bed) => {
                  const typeColors = {
                    general: { border: 'border-blue-300', typeBadge: 'bg-blue-100 text-blue-700', availBg: 'bg-blue-50 hover:bg-blue-100' },
                    icu: { border: 'border-orange-300', typeBadge: 'bg-orange-100 text-orange-700', availBg: 'bg-orange-50 hover:bg-orange-100' },
                    emergency: { border: 'border-red-300', typeBadge: 'bg-red-100 text-red-700', availBg: 'bg-red-50 hover:bg-red-100' },
                  };
                  const tc = typeColors[bed.bed_type] || typeColors.general;
                  const statusConfig = {
                    available: { bg: tc.availBg, dot: 'bg-green-500', text: 'text-green-700', label: 'Available', cursor: 'cursor-pointer' },
                    reserved: { bg: 'bg-yellow-50', dot: 'bg-yellow-500', text: 'text-yellow-700', label: 'Reserved', cursor: 'cursor-default' },
                    occupied: { bg: 'bg-gray-100', dot: 'bg-red-500', text: 'text-red-600', label: 'Occupied', cursor: 'cursor-default' },
                  };
                  const sc = statusConfig[bed.status] || statusConfig.available;
                  // Enrich occupied/reserved beds with patient info from state
                  const occupiedInfo = bed.status === 'occupied' ? occupiedBeds.find(o => o.bed_id === bed.bed_id) : null;
                  const reservedInfo = bed.status === 'reserved' ? reservedBeds.find(r => r.bed_id === bed.bed_id) : null;
                  return (
                    <div
                      key={bed.bed_id}
                      onClick={() => bed.status === 'available' && handleBedClick(bed)}
                      className={`rounded-xl border-2 ${tc.border} ${sc.bg} ${sc.cursor} p-3 transition-all ${
                        selectedBed?.bed_id === bed.bed_id ? 'ring-2 ring-green-500 ring-offset-1' : ''
                      } ${bed.status !== 'available' ? 'opacity-70' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${tc.typeBadge}`}>{bed.bed_type?.toUpperCase()}</span>
                        <span className={`w-2.5 h-2.5 rounded-full ${sc.dot} mt-0.5`}></span>
                      </div>
                      <p className="text-base font-bold text-gray-800">{bed.bed_number}</p>
                      <p className="text-xs text-gray-500">Ward {bed.ward_number}</p>
                      <p className={`text-xs font-semibold mt-1.5 ${sc.text}`}>{sc.label}</p>
                      {occupiedInfo && (
                        <>
                          <p className="text-xs font-semibold text-gray-700 mt-1 truncate" title={occupiedInfo.patient_name}>👤 {occupiedInfo.patient_name}</p>
                          {occupiedInfo.admitted_at && (
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(occupiedInfo.admitted_at).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                          )}
                        </>
                      )}
                      {reservedInfo && (
                        <p className="text-xs font-semibold text-yellow-700 mt-1 truncate" title={reservedInfo.patient_name}>👤 {reservedInfo.patient_name}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

      {/* Patient Selection Modal */}
      {showPatientSelectModal && selectedBed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Assign Bed {selectedBed.bed_number} to Patient</h3>
            <p className="text-sm text-gray-600 mb-4">Ward {selectedBed.ward_number} - {selectedBed.bed_type.toUpperCase()}</p>
            
            <div className="space-y-2 mb-6">
              {patientsNeedingBeds.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No patients in queue</p>
              ) : (
                patientsNeedingBeds.map((patient) => (
                  <div
                    key={patient.token_id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedPatient?.token_id === patient.token_id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg">{patient.patient_name || 'Patient'}</p>
                        <p className="text-sm text-gray-600">Token: {patient.token_id}</p>
                        <p className="text-sm text-gray-600">Doctor: {patient.doctor_name || 'N/A'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        patient.priority === 'emergency' ? 'bg-red-100 text-red-700' :
                        patient.priority === 'elder' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {patient.priority?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleBookBed}
                disabled={!selectedPatient}
                className={`flex-1 py-3 rounded-lg font-semibold ${
                  selectedPatient
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Assign Bed
              </button>
              <button
                onClick={() => {
                  setShowPatientSelectModal(false);
                  setSelectedBed(null);
                  setSelectedPatient(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

          {/* Occupied Beds Tab */}
          {activeTab === 'occupied-beds' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Occupied Beds</h2>
                <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-semibold">
                  {occupiedBeds.length} Occupied
                </span>
              </div>

              {occupiedBeds.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                  <div className="text-5xl mb-4">🛏️</div>
                  <p className="text-gray-500 text-lg">No beds currently occupied</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#0b1f3a] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm">Bed</th>
                        <th className="px-4 py-3 text-left text-sm">Ward</th>
                        <th className="px-4 py-3 text-left text-sm">Type</th>
                        <th className="px-4 py-3 text-left text-sm">Patient</th>
                        <th className="px-4 py-3 text-left text-sm">Admitted At</th>
                        <th className="px-4 py-3 text-left text-sm">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {occupiedBeds.map((bed) => (
                        <tr key={bed.bed_id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-bold text-gray-800">{bed.bed_number}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{bed.ward_number}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              bed.bed_type === 'icu' ? 'bg-orange-100 text-orange-700' :
                              bed.bed_type === 'emergency' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>{bed.bed_type?.toUpperCase()}</span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800">{bed.patient_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {bed.admitted_at ? new Date(bed.admitted_at).toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => { setDischargeTarget(bed); setShowDischargeModal(true); }}
                              className="bg-red-50 text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100 font-semibold text-xs"
                            >
                              Discharge
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Bed Requests Tab */}
          {activeTab === 'bed-requests' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Bed Reservation Requests</h2>
                <span className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm font-semibold">
                  {reservedBeds.length} Pending
                </span>
              </div>

              {reservedBeds.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <div className="text-5xl mb-4">🛏️</div>
                  <p className="text-gray-500 text-lg">No pending bed reservation requests</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reservedBeds.map((bed) => (
                    <div key={bed.bed_id} className="bg-white rounded-lg shadow border-l-4 border-yellow-400 p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-lg font-bold text-gray-800">Bed {bed.bed_number}</p>
                          <p className="text-sm text-gray-500">Ward {bed.ward_number}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            bed.bed_type === 'icu' ? 'bg-orange-100 text-orange-700' :
                            bed.bed_type === 'emergency' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{bed.bed_type?.toUpperCase()}</span>
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">RESERVED</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Patient</span>
                          <span className="font-semibold text-gray-800">{bed.patient_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Appointment Date</span>
                          <span className="font-semibold text-gray-800">{bed.appointment_date || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Reserved At</span>
                          <span className="font-semibold text-gray-800">{bed.reserved_at ? new Date(bed.reserved_at).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Priority</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            bed.priority === 'emergency' ? 'bg-red-100 text-red-700' :
                            bed.priority === 'elder' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>{bed.priority?.toUpperCase() || 'NORMAL'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmBed(bed.bed_id, bed.patient_id)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold text-sm"
                        >
                          ✓ Confirm Admission
                        </button>
                        <button
                          onClick={() => handleRejectBed(bed.bed_id)}
                          className="flex-1 bg-red-50 text-red-600 border border-red-300 py-2 rounded-lg hover:bg-red-100 font-semibold text-sm"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pharmacy Tab */}
          {activeTab === 'pharmacy' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Pharmacy Stock Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-4xl mb-2">⚠️</div>
                  <p className="text-gray-600 text-sm">Low / Out of Stock</p>
                  <p className="text-3xl font-bold text-red-600">
                    {pharmacyAlerts.filter(a => a.type === 'low_stock' || a.type === 'out_of_stock').length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-4xl mb-2">🗓️</div>
                  <p className="text-gray-600 text-sm">Expiring / Expired</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {pharmacyAlerts.filter(a => a.type === 'expiring_soon' || a.type === 'expired').length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-4xl mb-2">🔔</div>
                  <p className="text-gray-600 text-sm">Total Active Alerts</p>
                  <p className="text-3xl font-bold text-yellow-600">{pharmacyAlerts.length}</p>
                </div>
              </div>
              {pharmacyAlerts.length > 0 ? (
                <div className="space-y-2">
                  {pharmacyAlerts.map((alert, idx) => (
                    <div key={idx} className={`border-l-4 px-4 py-3 rounded-lg ${
                      alert.priority === 'critical' ? 'bg-red-50 border-red-500' :
                      alert.priority === 'high' ? 'bg-orange-50 border-orange-500' :
                      'bg-yellow-50 border-yellow-500'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm text-gray-800">
                            {alert.type === 'out_of_stock' ? '🚫' : alert.type === 'low_stock' ? '⚠️' : alert.type === 'expired' ? '☠️' : '⏰'}
                            {' '}{alert.medicine_name}
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">{alert.message}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                          alert.priority === 'critical' ? 'bg-red-600 text-white' :
                          alert.priority === 'high' ? 'bg-orange-500 text-white' :
                          'bg-yellow-400 text-yellow-900'
                        }`}>{alert.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                  <p className="text-green-700 text-sm">✅ All pharmacy stock levels are healthy</p>
                </div>
              )}
            </div>
          )}

          {/* Pharmacy Staff Tab */}
          {activeTab === 'pharmacy-staff' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Pharmacy Staff Management</h2>
                <button onClick={() => setShowPharmacyModal(true)} className="bg-[#0b1f3a] text-white px-6 py-2 rounded-lg hover:bg-blue-900">+ Create Pharmacy Staff</button>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0b1f3a] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm">Name</th>
                      <th className="px-4 py-3 text-left text-sm">Email</th>
                      <th className="px-4 py-3 text-left text-sm">Role</th>
                      <th className="px-4 py-3 text-left text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pharmacyStaff.map((staff, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold">{staff.name}</td>
                        <td className="px-4 py-3 text-sm">{staff.email}</td>
                        <td className="px-4 py-3 text-sm">Pharmacy Admin</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">ACTIVE</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (() => {
            const totalBeds = beds.length;
            const availBeds = beds.filter(b => b.status === 'available').length;
            const occBeds = beds.filter(b => b.status === 'occupied').length;
            const occupancyPct = totalBeds > 0 ? Math.round((occBeds / totalBeds) * 100) : 0;
            const bedCritical = totalBeds > 0 && availBeds === 0;
            const bedWarning = !bedCritical && totalBeds > 0 && availBeds < 5;
            const emergencyHigh = (stats.opd_analytics?.emergency_cases || 0) > 5;
            const totalBedAlerts = (bedCritical ? 1 : 0) + (bedWarning ? 1 : 0) + (emergencyHigh ? 1 : 0);
            return (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Hospital Alerts</h2>
                  <button onClick={() => fetchHospitalData(user.user_id)} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 font-semibold text-sm">🔄 Refresh</button>
                </div>

                {/* Bed Alerts — sourced from live beds state */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    🛏️ Bed Alerts
                    {totalBedAlerts > 0 && <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{totalBedAlerts}</span>}
                  </h3>
                  <div className="space-y-3">
                    {bedCritical && (
                      <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg flex justify-between items-start">
                        <div>
                          <p className="font-bold text-red-800">🚨 No Beds Available</p>
                          <p className="text-red-700 text-sm mt-1">All {totalBeds} beds are occupied or reserved. Immediate action required.</p>
                        </div>
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">CRITICAL</span>
                      </div>
                    )}
                    {bedWarning && (
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg flex justify-between items-start">
                        <div>
                          <p className="font-bold text-orange-800">⚠️ Low Bed Availability</p>
                          <p className="text-orange-700 text-sm mt-1">Only {availBeds} of {totalBeds} beds available ({occupancyPct}% occupancy)</p>
                        </div>
                        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">HIGH</span>
                      </div>
                    )}
                    {emergencyHigh && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg flex justify-between items-start">
                        <div>
                          <p className="font-bold text-yellow-800">⚠️ High Emergency Load</p>
                          <p className="text-yellow-700 text-sm mt-1">{stats.opd_analytics.emergency_cases} emergency cases in OPD queue</p>
                        </div>
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded">MEDIUM</span>
                      </div>
                    )}
                    {!bedCritical && !bedWarning && !emergencyHigh && (
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                        <p className="text-green-700 text-sm">✅ Bed availability is normal — {availBeds} of {totalBeds} beds available ({occupancyPct}% occupancy)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pharmacy Alerts — fetched from /pharmacy/alerts/{hospitalId} */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    💊 Pharmacy Alerts
                    {pharmacyAlerts.length > 0 && <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{pharmacyAlerts.length}</span>}
                  </h3>
                  {pharmacyAlerts.length === 0 ? (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                      <p className="text-green-700 text-sm">✅ All pharmacy stock levels are healthy</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pharmacyAlerts.map((alert, idx) => (
                        <div key={idx} className={`border-l-4 rounded-lg p-4 ${
                          alert.priority === 'critical' ? 'border-red-500 bg-red-50' :
                          alert.priority === 'high' ? 'border-orange-400 bg-orange-50' :
                          'border-yellow-400 bg-yellow-50'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-800">
                                {alert.type === 'out_of_stock' ? '🚫' : alert.type === 'low_stock' ? '⚠️' : alert.type === 'expired' ? '☠️' : '⏰'}
                                {' '}{alert.medicine_name}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                              {alert.stock !== undefined && (
                                <p className="text-xs text-gray-500 mt-1">Stock: {alert.stock} units / Min threshold: {alert.threshold} units</p>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                              alert.priority === 'critical' ? 'bg-red-600 text-white' :
                              alert.priority === 'high' ? 'bg-orange-500 text-white' :
                              'bg-yellow-400 text-yellow-900'
                            }`}>{alert.priority}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </main>
      </div>

      {/* Discharge Modal */}
      {showDischargeModal && dischargeTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-1">Discharge Patient</h3>
            <p className="text-sm text-gray-500 mb-5">
              Bed <span className="font-semibold text-gray-800">{dischargeTarget.bed_number}</span> — Ward {dischargeTarget.ward_number} — Patient: <span className="font-semibold text-gray-800">{dischargeTarget.patient_name}</span>
            </p>
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-1">Discharge Note <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                rows="3"
                value={dischargeNote}
                onChange={(e) => setDischargeNote(e.target.value)}
                placeholder="e.g. Patient recovered, follow-up in 2 weeks..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-5 text-sm text-yellow-800">
              ⚠️ This will release the bed and record discharge time: <span className="font-semibold">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDischargeBed}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 font-semibold"
              >
                Confirm Discharge
              </button>
              <button
                onClick={() => { setShowDischargeModal(false); setDischargeTarget(null); setDischargeNote(''); }}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-1">Add New Doctor</h3>
            <p className="text-sm text-gray-500 mb-4">A login account will be created for the doctor.</p>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Doctor Name</label>
                <input type="text" required value={doctorForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const firstName = name.replace(/Dr\.?\s*/i, '').split(' ')[0].toLowerCase();
                    setDoctorForm({...doctorForm, name, email: firstName ? `${firstName}@gmail.com` : doctorForm.email});
                  }}
                  className="w-full border rounded px-3 py-2" placeholder="e.g. Dr. Rajesh Kumar" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Department</label>
                <select required value={doctorForm.department_id} onChange={(e) => setDoctorForm({...doctorForm, department_id: e.target.value})} className="w-full border rounded px-3 py-2">
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Specialization</label>
                <input type="text" required value={doctorForm.specialization} onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Contact Number</label>
                <input type="tel" value={doctorForm.contact_number} onChange={(e) => setDoctorForm({...doctorForm, contact_number: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Login Email</label>
                <input type="email" required value={doctorForm.email} onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="Auto-filled from name" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Login Password</label>
                <input type="text" required value={doctorForm.password} onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="e.g. 12" />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
                📋 Credentials to share: <strong>{doctorForm.email || 'email'}</strong> / <strong>{doctorForm.password || 'password'}</strong>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-[#0b1f3a] text-white py-2 rounded-lg hover:bg-blue-900">Add Doctor</button>
                <button type="button" onClick={() => { setShowDoctorModal(false); setDoctorForm({ name: '', department_id: '', specialization: '', contact_number: '', email: '', password: '' }); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Pharmacy Staff Modal */}
      {showPharmacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create Pharmacy Staff Account</h3>
            <form onSubmit={handleAddPharmacyStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Staff Name</label>
                <input type="text" required value={pharmacyForm.name} onChange={(e) => setPharmacyForm({...pharmacyForm, name: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input type="email" required value={pharmacyForm.email} onChange={(e) => setPharmacyForm({...pharmacyForm, email: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Phone Number</label>
                <input type="tel" value={pharmacyForm.phone} onChange={(e) => setPharmacyForm({...pharmacyForm, phone: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Password</label>
                <input type="password" required value={pharmacyForm.password} onChange={(e) => setPharmacyForm({...pharmacyForm, password: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-[#0b1f3a] text-white py-2 rounded-lg hover:bg-blue-900">Create Account</button>
                <button type="button" onClick={() => setShowPharmacyModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bed Modal */}
      {showBedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Ward & Beds</h3>
            <form onSubmit={handleAddBed} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Ward Name</label>
                <input type="text" required value={bedForm.ward_name} onChange={(e) => setBedForm({...bedForm, ward_name: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="e.g., General Ward, ICU Ward" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Ward Number</label>
                <input type="text" required value={bedForm.ward_number} onChange={(e) => setBedForm({...bedForm, ward_number: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="e.g., W1, W2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Number of Beds in Ward</label>
                <input type="number" required min="1" value={bedForm.total_beds} onChange={(e) => setBedForm({...bedForm, total_beds: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="e.g., 10" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Bed Type</label>
                <select value={bedForm.bed_type} onChange={(e) => setBedForm({...bedForm, bed_type: e.target.value})} className="w-full border rounded px-3 py-2">
                  <option value="general">General</option>
                  <option value="icu">ICU</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                This will create {bedForm.total_beds || 0} beds numbered as {bedForm.ward_number}-1, {bedForm.ward_number}-2, etc.
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-[#0b1f3a] text-white py-2 rounded-lg hover:bg-blue-900">Add Ward & Beds</button>
                <button type="button" onClick={() => setShowBedModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Department</h3>
            <form onSubmit={handleAddDepartment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Department Name</label>
                <input type="text" required value={departmentForm.department_name} onChange={(e) => setDepartmentForm({...departmentForm, department_name: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="e.g., Cardiology" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea value={departmentForm.description} onChange={(e) => setDepartmentForm({...departmentForm, description: e.target.value})} className="w-full border rounded px-3 py-2" rows="3" placeholder="Brief description of the department"></textarea>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-[#0b1f3a] text-white py-2 rounded-lg hover:bg-blue-900">Add Department</button>
                <button type="button" onClick={() => setShowDepartmentModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;
