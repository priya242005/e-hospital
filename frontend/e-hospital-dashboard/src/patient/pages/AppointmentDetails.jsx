import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import patientApi from '../services/patientApi';
import StatusBadge from '../components/StatusBadge';

const BED_TYPE_STYLE = {
  general: 'bg-blue-100 text-blue-700',
  icu: 'bg-orange-100 text-orange-700',
  emergency: 'bg-red-100 text-red-700'
};

const BED_STATUS_STYLE = {
  reserved: { bg: 'bg-yellow-50 border-yellow-300', badge: 'bg-yellow-100 text-yellow-700', icon: '⏳', label: 'Pending — Awaiting hospital confirmation' },
  occupied: { bg: 'bg-green-50 border-green-400', badge: 'bg-green-600 text-white', icon: '✅', label: 'Confirmed — Your bed is booked and ready' },
  available: { bg: 'bg-gray-50 border-gray-300', badge: 'bg-gray-100 text-gray-600', icon: '✓', label: 'Discharged' }
};

const AppointmentDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointment } = location.state || {};
  const [waitingData, setWaitingData] = useState(null);
  const [bedInfo, setBedInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appointment) return;
    // Always fetch bed info if appointment has a bed_id
    if (appointment.bed_id || appointment.appointment_id) {
      fetchBedInfo();
      // Auto-refresh bed status every 20 seconds
      const bedInterval = setInterval(fetchBedInfo, 20000);
      if (appointment.token_status === 'waiting') {
        fetchWaitingTime();
        const waitInterval = setInterval(fetchWaitingTime, 30000);
        return () => { clearInterval(bedInterval); clearInterval(waitInterval); };
      }
      return () => clearInterval(bedInterval);
    }
    if (appointment.token_status === 'waiting') {
      fetchWaitingTime();
      const interval = setInterval(fetchWaitingTime, 30000);
      return () => clearInterval(interval);
    }
    setLoading(false);
  }, [appointment]);

  const fetchWaitingTime = async () => {
    try {
      const response = await patientApi.getWaitingTime(appointment.token_id);
      setWaitingData(response.data);
    } catch {
      setWaitingData({ patients_ahead: 0, expected_waiting_time_min: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchBedInfo = async () => {
    try {
      const res = await patientApi.getBedByAppointment(appointment.appointment_id);
      setBedInfo(res.data);
    } catch {
      setBedInfo(null);
    }
  };

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No appointment data</p>
          <button onClick={() => navigate('/my-appointments')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  const bedStyle = bedInfo ? BED_STATUS_STYLE[bedInfo.status] || BED_STATUS_STYLE.reserved : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/my-appointments')} className="mb-4 text-blue-600 hover:underline">
          ← Back to My Appointments
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0b1f3a] to-blue-700 p-6">
            <p className="text-blue-200 text-sm mb-1">Token Number</p>
            <p className="text-4xl font-bold text-white">{appointment.token_id || 'N/A'}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Row */}
            <div className="flex flex-wrap gap-3">
              <StatusBadge status={appointment.token_status || appointment.status} />
              <StatusBadge status={appointment.priority} />
            </div>

            {/* Appointment Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Patient', value: appointment.patient_name },
                { label: 'Hospital', value: appointment.hospital_name },
                { label: 'Department', value: appointment.department_name },
                { label: 'Doctor', value: appointment.doctor_name },
                { label: 'Date', value: appointment.appointment_date },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="font-semibold text-gray-800">{value || 'N/A'}</p>
                </div>
              ))}
            </div>

            {/* Live Waiting Info */}
            {appointment.token_status === 'waiting' && waitingData && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h3 className="text-lg font-bold text-[#0b1f3a] mb-4">Live Queue Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Patients Ahead</p>
                    <p className="text-4xl font-bold text-yellow-600">{waitingData.patients_ahead}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Estimated Wait</p>
                    <p className="text-4xl font-bold text-green-600">{waitingData.expected_waiting_time_min}</p>
                    <p className="text-xs text-gray-500">minutes</p>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-400 mt-3">Auto-refreshing every 30 seconds</p>
              </div>
            )}

            {/* Completed */}
            {appointment.token_status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <div className="text-4xl mb-2">✓</div>
                <p className="text-lg font-semibold text-green-800">Consultation Completed</p>
              </div>
            )}

            {/* Bed Status */}
            {bedInfo && (
              <div className={`border-2 rounded-xl p-5 ${bedStyle.bg}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">🛏️ Bed / Admission Status</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${bedStyle.badge}`}>
                    {bedInfo.status?.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500">Bed Number</p>
                    <p className="font-bold text-gray-800">{bedInfo.bed_number}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500">Ward</p>
                    <p className="font-bold text-gray-800">{bedInfo.ward_number}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500">Type</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${BED_TYPE_STYLE[bedInfo.bed_type] || 'bg-gray-100 text-gray-700'}`}>
                      {bedInfo.bed_type?.toUpperCase()}
                    </span>
                  </div>
                  {bedInfo.admitted_at && (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">Admitted At</p>
                      <p className="font-semibold text-gray-800 text-sm">{new Date(bedInfo.admitted_at).toLocaleString()}</p>
                    </div>
                  )}
                  {bedInfo.discharged_at && (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">Discharged At</p>
                      <p className="font-semibold text-gray-800 text-sm">{new Date(bedInfo.discharged_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xl">{bedStyle.icon}</span>
                  <span className="text-gray-600">{bedStyle.label}</span>
                </div>
              </div>
            )}

            <button onClick={() => navigate('/')} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
