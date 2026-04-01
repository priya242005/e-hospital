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

const BED_BADGE = {
  occupied: 'bg-green-600 text-white',
  reserved: 'bg-yellow-100 text-yellow-800',
  available: 'bg-gray-100 text-gray-500',
};

const BED_LABEL = {
  occupied: (bed) => `Bed Confirmed — ${bed.bed_number} / Ward ${bed.ward_number}`,
  reserved: (bed) => `Bed Pending — ${bed.bed_number}`,
  available: () => 'Discharged',
};

const MyAppointments = () => {
  const [currentAppointments, setCurrentAppointments] = useState([]);
  const [historyAppointments, setHistoryAppointments] = useState([]);
  const [bedStatuses, setBedStatuses] = useState({});
  const [activeTab, setActiveTab] = useState('current');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await patientApi.getUserAppointments(user.user_id);
      const today = new Date().toISOString().split('T')[0];

      setCurrentAppointments(res.data.filter(a => a.appointment_date === today && a.token_status === 'waiting'));
      setHistoryAppointments(
        res.data.filter(a => a.appointment_date !== today || a.token_status === 'completed')
          .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
      );

      const withBeds = res.data.filter(a => a.bed_id && a.appointment_id);
      const results = await Promise.all(
        withBeds.map(a =>
          patientApi.getBedByAppointment(a.appointment_id)
            .then(r => ({ id: a.appointment_id, bed: r.data }))
            .catch(() => null)
        )
      );
      const map = {};
      results.forEach(r => { if (r?.bed) map[r.id] = r.bed; });
      setBedStatuses(map);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const appointments = activeTab === 'current' ? currentAppointments : historyAppointments;

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
            <h1 className="text-xl font-bold">My Appointments</h1>
            <p className="text-blue-300 text-sm mt-0.5">Track and manage your bookings</p>
          </div>
          <button onClick={() => navigate('/patient/home')} className="text-sm border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition">
            Back
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { key: 'current', label: `Active (${currentAppointments.length})` },
            { key: 'history', label: `History (${historyAppointments.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === t.key
                  ? 'border-[#0b1f3a] text-[#0b1f3a]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <p className="text-gray-500 mb-4">{activeTab === 'current' ? 'No active appointments' : 'No appointment history'}</p>
            {activeTab === 'current' && (
              <button onClick={() => navigate('/opd-booking')} className="bg-[#0b1f3a] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 transition">
                Book Appointment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map(apt => {
              const bed = bedStatuses[apt.appointment_id];
              return (
                <div
                  key={apt.token_id || apt.appointment_id}
                  onClick={() => navigate('/appointment-details', { state: { appointment: apt } })}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                          Token #{apt.token_id || 'N/A'}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[apt.token_status] || 'bg-gray-100 text-gray-600'}`}>
                          {apt.token_status?.toUpperCase()}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PRIORITY_STYLE[apt.priority] || 'bg-gray-100 text-gray-600'}`}>
                          {apt.priority?.toUpperCase()}
                        </span>
                        {apt.bed_id && bed && (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BED_BADGE[bed.status] || 'bg-gray-100 text-gray-600'}`}>
                            {BED_LABEL[bed.status]?.(bed) || 'Bed'}
                          </span>
                        )}
                        {apt.bed_id && !bed && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">Bed Requested</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm">
                        {[
                          { label: 'Patient', value: apt.patient_name },
                          { label: 'Hospital', value: apt.hospital_name },
                          { label: 'Department', value: apt.department_name },
                          { label: 'Doctor', value: apt.doctor_name },
                          { label: 'Date', value: apt.appointment_date },
                        ].map(f => (
                          <div key={f.label}>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">{f.label}</p>
                            <p className="font-medium text-gray-700 truncate">{f.value || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 sm:text-right flex-shrink-0">
                      View details →
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyAppointments;
