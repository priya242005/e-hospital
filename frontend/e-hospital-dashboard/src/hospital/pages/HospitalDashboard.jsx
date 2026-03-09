import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HospitalDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.user_id || userData.role !== 'hospital_admin') {
      navigate('/hospital/login');
      return;
    }
    setUser(userData);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const hospitalRes = await axios.get(`http://localhost:8000/hospitals/by-user/${userData.user_id}`, { headers });
      const hospitalId = hospitalRes.data.hospital_id;

      const dashboardRes = await axios.get(`http://localhost:8000/hospitals/${hospitalId}/dashboard`, { headers });
      setStats(dashboardRes.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setStats('no_hospital');
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/hospital/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!stats || stats === 'no_hospital') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-900 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Hospital Dashboard</h1>
                <p className="text-blue-200 text-sm mt-1">Welcome, {user?.name}</p>
              </div>
              <button onClick={handleLogout} className="bg-white text-blue-900 px-6 py-2 rounded-lg hover:bg-gray-100 transition font-medium">
                Logout
              </button>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">No Hospital Found</h3>
            <p className="text-yellow-700">Please contact the administrator to link your account with a hospital.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Hospital Dashboard</h1>
              <p className="text-blue-200 text-sm mt-1">Welcome, {user?.name}</p>
            </div>
            <button onClick={handleLogout} className="bg-white text-blue-900 px-6 py-2 rounded-lg hover:bg-gray-100 transition font-medium">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hospital Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Hospital Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-gray-600 text-xs">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.overview.total_doctors}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-gray-600 text-xs">Active Doctors</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.overview.active_doctors}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-gray-600 text-xs">Total Beds</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.overview.total_beds}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-gray-600 text-xs">Available Beds</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.overview.available_beds}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-gray-600 text-xs">Today OPD</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.overview.today_opd_patients}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-gray-600 text-xs">Wait Time (min)</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.overview.current_waiting_time}</p>
            </div>
          </div>
        </div>

        {/* OPD Queue Analytics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">OPD Queue Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-gray-600 text-xs">Waiting Patients</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.opd_analytics.waiting_patients}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-gray-600 text-xs">Completed Today</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.opd_analytics.completed_today}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-gray-600 text-xs">Emergency Cases</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.opd_analytics.emergency_cases}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-gray-600 text-xs">Elder Cases</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.opd_analytics.elder_cases}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-gray-600 text-xs">Avg Wait (min)</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.opd_analytics.avg_waiting_time}</p>
            </div>
          </div>
        </div>

        {/* Doctor Load Monitoring */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Doctor Load Monitoring</h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Doctor Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Current Load</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Load %</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.doctor_loads.map((doctor) => (
                  <tr key={doctor.doctor_id} className="border-t">
                    <td className="px-4 py-3 text-sm">{doctor.name}</td>
                    <td className="px-4 py-3 text-sm">{doctor.current_load}/{doctor.max_load}</td>
                    <td className="px-4 py-3 text-sm">{doctor.load_percent}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        doctor.status === 'green' ? 'bg-green-100 text-green-700' :
                        doctor.status === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {doctor.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bed & Pharmacy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Bed Monitoring</h2>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-gray-600 text-sm">Occupancy</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.bed_status.occupancy_percent}%</p>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  stats.bed_status.status === 'green' ? 'bg-green-100' :
                  stats.bed_status.status === 'yellow' ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}>
                  <span className="text-2xl">🛏️</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {stats.bed_status.available_beds} / {stats.bed_status.total_beds} beds available
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pharmacy Alerts</h2>
            <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Low Stock</span>
                <span className="text-lg font-bold text-red-600">{stats.pharmacy_alerts.low_stock}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expiring Soon</span>
                <span className="text-lg font-bold text-yellow-600">{stats.pharmacy_alerts.expiring_soon}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">High Demand</span>
                <span className="text-lg font-bold text-blue-600">{stats.pharmacy_alerts.high_demand}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HospitalDashboard;
