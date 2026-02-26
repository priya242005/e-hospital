import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import patientApi from '../services/patientApi';
import StatusBadge from '../components/StatusBadge';

const AppointmentDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointment } = location.state || {};
  const [waitingData, setWaitingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appointment && appointment.status === 'waiting') {
      fetchWaitingTime();
      const interval = setInterval(fetchWaitingTime, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [appointment]);

  const fetchWaitingTime = async () => {
    try {
      const response = await patientApi.getWaitingTime(appointment.token);
      setWaitingData(response.data);
    } catch (error) {
      console.error('Failed to fetch waiting time');
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No appointment data</p>
          <button
            onClick={() => navigate('/my-appointments')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/my-appointments')}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to My Appointments
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-blue-100 text-blue-800 px-6 py-3 rounded-full mb-4">
              Token: {appointment.token}
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Appointment Details</h2>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <StatusBadge status={appointment.status} />
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">Priority</p>
              <StatusBadge status={appointment.priority} />
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">Department</p>
              <p className="text-lg font-semibold">{appointment.department}</p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">Doctor ID</p>
              <p className="text-lg font-semibold">{appointment.doctor_id}</p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">Hospital ID</p>
              <p className="text-lg font-semibold">{appointment.hospital_id}</p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">Date</p>
              <p className="text-lg font-semibold">{appointment.opd_date}</p>
            </div>
          </div>

          {appointment.status === 'waiting' && waitingData && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Live Waiting Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 text-center shadow">
                  <p className="text-sm text-gray-600 mb-2">Patients Ahead</p>
                  <p className="text-4xl font-bold text-yellow-600">{waitingData.patients_ahead}</p>
                </div>

                <div className="bg-white rounded-lg p-4 text-center shadow">
                  <p className="text-sm text-gray-600 mb-2">Estimated Wait</p>
                  <p className="text-4xl font-bold text-green-600">{waitingData.expected_waiting_time_min}</p>
                  <p className="text-sm text-gray-600">minutes</p>
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-gray-600">
                Auto-refreshing every 30 seconds
              </div>
            </div>
          )}

          {appointment.status === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-5xl mb-3">✓</div>
              <p className="text-xl font-semibold text-green-800">Consultation Completed</p>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium mt-6"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
