import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import patientApi from '../services/patientApi';

const PRIORITY_STYLE = {
  emergency: 'bg-red-100 text-red-700',
  elder:     'bg-orange-100 text-orange-700',
  normal:    'bg-blue-100 text-blue-700',
};

const STATUS_STYLE = {
  waiting:   'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
};

const AppointmentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await patientApi.getUserAppointments(user.user_id);
      const today = new Date().toISOString().split('T')[0];
      setHistory(
        res.data
          .filter(a => a.appointment_date !== today || a.token_status === 'completed')
          .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
      );
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const filtered = history.filter(a =>
    !search ||
    a.hospital_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.doctor_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.department_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#0b1f3a] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0b1f3a] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Appointment History</h1>
            <p className="text-blue-300 text-sm mt-0.5">{history.length} past appointments</p>
          </div>
          <button onClick={() => navigate('/patient/home')} className="text-sm border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition">
            Back
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-5">
        <input
          type="text"
          placeholder="Search by hospital, doctor or department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0b1f3a] focus:border-transparent outline-none"
        />

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <p className="text-gray-500">No appointment history found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0b1f3a] text-white">
                  <th className="px-5 py-3.5 text-left font-semibold">Token</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Patient</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Hospital</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Department</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Doctor</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Date</th>
                  <th className="px-5 py-3.5 text-center font-semibold">Priority</th>
                  <th className="px-5 py-3.5 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(apt => (
                  <tr key={apt.token_id || apt.appointment_id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{apt.token_id || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">{apt.patient_name || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">{apt.hospital_name || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">{apt.department_name || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">{apt.doctor_name || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500">{apt.appointment_date || '—'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PRIORITY_STYLE[apt.priority] || 'bg-gray-100 text-gray-600'}`}>
                        {apt.priority?.toUpperCase() || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[apt.token_status] || 'bg-gray-100 text-gray-600'}`}>
                        {apt.token_status?.toUpperCase() || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AppointmentHistory;
