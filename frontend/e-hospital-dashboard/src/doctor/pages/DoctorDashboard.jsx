import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8000';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [queueData, setQueueData] = useState({ waiting: [], completed: [], waiting_count: 0, completed_count: 0, total_today: 0 });
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('queue');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.user_id || userData.role !== 'doctor') {
      navigate('/doctor/login');
      return;
    }
    setUser(userData);
    fetchData(userData);
    const interval = setInterval(() => fetchData(userData), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const doctorId = userData.doctor_id;

      const [queueRes, doctorRes] = await Promise.all([
        axios.get(`${API}/opd/doctor/${doctorId}`, { headers }),
        axios.get(`${API}/doctors/${doctorId}`, { headers })
      ]);
      setQueueData(queueRes.data);
      setDoctorInfo(doctorRes.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (history.length > 0) return; // already loaded
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/opd/doctor/${user.doctor_id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch {
      console.error('Failed to fetch history');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'history') fetchHistory();
  };

  const handleComplete = async (tokenId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/opd/${tokenId}`, { status: 'completed' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(user);
    } catch {
      alert('Failed to mark as completed');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/doctor/login');
  };

  const priorityBadge = (p) => ({
    emergency: 'bg-red-100 text-red-700',
    elder: 'bg-yellow-100 text-yellow-700',
    normal: 'bg-blue-100 text-blue-700'
  }[p] || 'bg-blue-100 text-blue-700');

  const bedTypeBadge = (t) => ({
    icu: 'bg-orange-100 text-orange-700',
    emergency: 'bg-red-100 text-red-700',
    general: 'bg-green-100 text-green-700'
  }[t] || 'bg-gray-100 text-gray-600');

  const navItems = [
    { id: 'queue', icon: '📋', label: 'Today\'s Queue' },
    { id: 'completed', icon: '✅', label: `Completed (${queueData.completed_count})` },
    { id: 'history', icon: '🗂️', label: 'Patient History' },
  ];

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-xl text-gray-500">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-teal-900 text-white ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col flex-shrink-0`}>
        <div className="p-4 border-b border-teal-700">
          {sidebarOpen ? (
            <div>
              <div className="w-12 h-12 bg-teal-700 rounded-full flex items-center justify-center text-2xl mb-2">👨‍⚕️</div>
              <p className="font-bold text-sm leading-tight">{user?.name}</p>
              <p className="text-teal-300 text-xs mt-0.5">{doctorInfo?.specialization || 'Doctor'}</p>
            </div>
          ) : (
            <div className="text-2xl text-center">👨‍⚕️</div>
          )}
        </div>

        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full px-4 py-3 text-left hover:bg-teal-800 transition flex items-center gap-3 ${activeTab === item.id ? 'bg-teal-800 border-l-4 border-white' : ''}`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Stats in sidebar */}
        {sidebarOpen && (
          <div className="p-4 border-t border-teal-700 space-y-2">
            <div className="bg-teal-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-300">{queueData.waiting_count}</p>
              <p className="text-xs text-teal-300">Waiting</p>
            </div>
            <div className="bg-teal-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-300">{queueData.total_today}</p>
              <p className="text-xs text-teal-300">Total Today</p>
            </div>
          </div>
        )}

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-4 border-t border-teal-700 hover:bg-teal-800 text-center">
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-teal-900">Doctor Dashboard</h1>
            <p className="text-sm text-gray-500">
              {doctorInfo?.specialization} • {user?.name} • <span className="text-green-600">● Live</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => fetchData(user)} className="bg-teal-50 text-teal-700 border border-teal-200 px-4 py-2 rounded-lg hover:bg-teal-100 font-semibold text-sm">
              🔄 Refresh
            </button>
            <button onClick={handleLogout} className="bg-teal-900 text-white px-5 py-2 rounded-lg hover:bg-teal-800 font-semibold text-sm">
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">

          {/* Today's Queue Tab */}
          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Today's Waiting Queue</h2>
                <span className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm font-semibold">
                  {queueData.waiting_count} Waiting
                </span>
              </div>

              {queueData.waiting.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-16 text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-gray-500 text-xl font-semibold">No patients waiting</p>
                  <p className="text-gray-400 text-sm mt-2">Queue is clear for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queueData.waiting.map((patient, idx) => (
                    <div key={patient.token_id} className={`bg-white rounded-xl shadow-md border-l-4 p-5 ${
                      idx === 0 ? 'border-teal-500 ring-2 ring-teal-100' :
                      patient.priority === 'emergency' ? 'border-red-500' :
                      patient.priority === 'elder' ? 'border-yellow-400' : 'border-gray-200'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          {/* Position badge */}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 ${
                            idx === 0 ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {patient.position}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-gray-800 text-lg">{patient.patient_name || 'Patient'}</p>
                              {idx === 0 && <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full">NEXT</span>}
                            </div>
                            <p className="text-sm text-gray-400 mt-0.5">Token: <span className="font-mono font-semibold text-gray-600">{patient.token_id}</span></p>

                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityBadge(patient.priority)}`}>
                                {patient.priority?.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                ⏱ ~{patient.waiting_minutes} min wait
                              </span>
                            </div>

                            {/* Bed info */}
                            {patient.bed_number && (
                              <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 w-fit">
                                <span className="text-base">🛏️</span>
                                <div className="text-xs">
                                  <span className="font-bold text-blue-800">Bed {patient.bed_number}</span>
                                  <span className="text-blue-600"> • Ward {patient.ward_number}</span>
                                  <span className={`ml-2 px-1.5 py-0.5 rounded font-semibold ${bedTypeBadge(patient.bed_type)}`}>
                                    {patient.bed_type?.toUpperCase()}
                                  </span>
                                  <span className={`ml-1 px-1.5 py-0.5 rounded font-semibold ${
                                    patient.bed_status === 'occupied' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {patient.bed_status?.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Complete button only for first patient */}
                        {idx === 0 && (
                          <button
                            onClick={() => handleComplete(patient.token_id)}
                            className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-semibold text-sm flex-shrink-0"
                          >
                            ✓ Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Completed Today Tab */}
          {activeTab === 'completed' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Completed Today</h2>
                <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-semibold">
                  {queueData.completed_count} Done
                </span>
              </div>

              {queueData.completed.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-16 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-500 text-xl font-semibold">No completed consultations yet</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-teal-900 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm">Token</th>
                        <th className="px-4 py-3 text-left text-sm">Patient</th>
                        <th className="px-4 py-3 text-left text-sm">Priority</th>
                        <th className="px-4 py-3 text-left text-sm">Bed</th>
                        <th className="px-4 py-3 text-left text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queueData.completed.map((p) => (
                        <tr key={p.token_id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">{p.token_id}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800">{p.patient_name || 'Patient'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityBadge(p.priority)}`}>
                              {p.priority?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {p.bed_number ? (
                              <span className="text-blue-700 font-semibold">🛏️ {p.bed_number} / W{p.ward_number}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">DONE</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">All Patient History</h2>
                <span className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-sm font-semibold">
                  {history.length} Total
                </span>
              </div>

              {history.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-16 text-center">
                  <div className="text-6xl mb-4">🗂️</div>
                  <p className="text-gray-500 text-xl font-semibold">No history yet</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-teal-900 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm">Date</th>
                        <th className="px-4 py-3 text-left text-sm">Token</th>
                        <th className="px-4 py-3 text-left text-sm">Patient</th>
                        <th className="px-4 py-3 text-left text-sm">Department</th>
                        <th className="px-4 py-3 text-left text-sm">Priority</th>
                        <th className="px-4 py-3 text-left text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((p) => (
                        <tr key={p.token_id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">{p.opd_date}</td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">{p.token_id}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800">{p.patient_name || 'Patient'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{p.department_name || p.department || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityBadge(p.priority)}`}>
                              {p.priority?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">COMPLETED</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
