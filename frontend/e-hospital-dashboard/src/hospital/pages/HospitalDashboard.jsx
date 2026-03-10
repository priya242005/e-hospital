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
  
  const [doctorForm, setDoctorForm] = useState({ name: '', department_id: '', specialization: '', contact_number: '', email: '' });
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
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/doctors', {
        ...doctorForm,
        hospital_id: hospitalId,
        availability: 'available'
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Doctor added successfully');
      setShowDoctorModal(false);
      setDoctorForm({ name: '', department_id: '', specialization: '', contact_number: '', email: '' });
      fetchHospitalData(user.user_id);
    } catch (error) {
      alert('Failed to add doctor');
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
            { id: 'pharmacy-staff', icon: '👥', label: 'Pharmacy Staff' },
            { id: 'pharmacy', icon: '💊', label: 'Pharmacy' },
            { id: 'alerts', icon: '🔔', label: 'Alerts' }
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
              
              {/* Bed Type Filter */}
              <div className="flex gap-2">
                <button onClick={() => setBedTypeFilter('all')} className={`px-4 py-2 rounded-lg font-semibold ${bedTypeFilter === 'all' ? 'bg-[#0b1f3a] text-white' : 'bg-gray-200 text-gray-700'}`}>All ({beds.length})</button>
                <button onClick={() => setBedTypeFilter('general')} className={`px-4 py-2 rounded-lg font-semibold ${bedTypeFilter === 'general' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>General ({beds.filter(b => b.bed_type === 'general').length})</button>
                <button onClick={() => setBedTypeFilter('icu')} className={`px-4 py-2 rounded-lg font-semibold ${bedTypeFilter === 'icu' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700'}`}>ICU ({beds.filter(b => b.bed_type === 'icu').length})</button>
                <button onClick={() => setBedTypeFilter('emergency')} className={`px-4 py-2 rounded-lg font-semibold ${bedTypeFilter === 'emergency' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}>Emergency ({beds.filter(b => b.bed_type === 'emergency').length})</button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {sortedBeds.map((bed) => (
                  <div
                    key={bed.bed_id}
                    onClick={() => handleBedClick(bed)}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      bed.bed_type === 'general' ? 'border-blue-400' :
                      bed.bed_type === 'icu' ? 'border-orange-400' :
                      'border-red-400'
                    } ${
                      bed.status === 'available' ? (bed.bed_type === 'general' ? 'bg-blue-50 hover:bg-blue-100' : bed.bed_type === 'icu' ? 'bg-orange-50 hover:bg-orange-100' : 'bg-red-50 hover:bg-red-100') :
                      bed.status === 'reserved' ? 'bg-yellow-50 opacity-60' :
                      'bg-gray-100 opacity-40'
                    } ${selectedBed?.bed_id === bed.bed_id ? 'ring-4 ring-green-500' : ''}`}
                  >
                    <p className="text-xs text-gray-600 font-semibold">Ward {bed.ward_number}</p>
                    <p className="text-lg font-bold mt-1">{bed.bed_number}</p>
                    <p className={`text-xs font-semibold mt-2 px-2 py-1 rounded ${
                      bed.bed_type === 'general' ? 'bg-blue-200 text-blue-800' :
                      bed.bed_type === 'icu' ? 'bg-orange-200 text-orange-800' :
                      'bg-red-200 text-red-800'
                    }`}>{bed.bed_type.toUpperCase()}</p>
                    <p className={`text-xs font-semibold mt-1 ${
                      bed.status === 'available' ? 'text-green-600' :
                      bed.status === 'reserved' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>{bed.status.toUpperCase()}</p>
                  </div>
                ))}
              </div>
              
              {selectedBed && !showPatientSelectModal && (
                <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-6 border-2 border-green-500">
                  <h3 className="font-bold text-lg mb-2">Selected Bed: {selectedBed.bed_number}</h3>
                  <p className="text-sm text-gray-600 mb-4">Ward {selectedBed.ward_number} - {selectedBed.bed_type.toUpperCase()}</p>
                  <button onClick={() => setSelectedBed(null)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 font-semibold">Cancel</button>
                </div>
              )}
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

          {/* Pharmacy Tab */}
          {activeTab === 'pharmacy' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Pharmacy Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-gray-600 text-sm">Prescriptions Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">0</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-gray-600 text-sm">Prescriptions Ready</p>
                  <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-4xl mb-2">⚠️</div>
                  <p className="text-gray-600 text-sm">Low Stock Medicines</p>
                  <p className="text-3xl font-bold text-red-600">0</p>
                </div>
              </div>
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
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Hospital Alerts</h2>
              <div className="space-y-4">
                {overview.available_beds < 5 && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <h3 className="font-bold text-red-800">🚨 Bed Shortage Alert</h3>
                    <p className="text-red-700 text-sm mt-1">Only {overview.available_beds} beds available</p>
                  </div>
                )}
                {stats.opd_analytics?.emergency_cases > 5 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <h3 className="font-bold text-yellow-800">⚠️ High Emergency Load</h3>
                    <p className="text-yellow-700 text-sm mt-1">{stats.opd_analytics.emergency_cases} emergency cases in queue</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Doctor Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Doctor</h3>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Doctor Name</label>
                <input type="text" required value={doctorForm.name} onChange={(e) => setDoctorForm({...doctorForm, name: e.target.value})} className="w-full border rounded px-3 py-2" />
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
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input type="email" value={doctorForm.email} onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-[#0b1f3a] text-white py-2 rounded-lg hover:bg-blue-900">Add Doctor</button>
                <button type="button" onClick={() => setShowDoctorModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
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
