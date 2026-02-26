import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import patientApi from '../services/patientApi';
import StatusBadge from '../components/StatusBadge';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await patientApi.getPatientAppointments(user.user_id);
      setAppointments(response.data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (appointment) => {
    navigate('/appointment-details', { state: { appointment } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/')} className="mb-4 text-blue-600 hover:underline">
          ← Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Appointments</h2>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No appointments found</p>
              <button
                onClick={() => navigate('/opd-booking')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Book New Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.appointment_id}
                  className={`border rounded-lg p-6 hover:shadow-lg transition ${
                    appointment.token_status === 'waiting' ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Token: {appointment.token_id || 'N/A'}
                        </h3>
                        {appointment.token_status === 'waiting' && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Current
                          </span>
                        )}
                        {appointment.token_status === 'completed' && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                            Completed
                          </span>
                        )}
                        <StatusBadge status={appointment.priority} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-600">Patient</p>
                          <p className="font-medium">{appointment.patient_name || 'Self'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Hospital</p>
                          <p className="font-medium">{appointment.hospital_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Department</p>
                          <p className="font-medium">{appointment.department_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Doctor</p>
                          <p className="font-medium">{appointment.doctor_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium">{appointment.appointment_date}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <StatusBadge status={appointment.token_status || appointment.status} />
                        </div>
                      </div>
                    </div>

                    {appointment.token_status === 'waiting' && (
                      <button
                        onClick={() => navigate('/waiting-time', { state: { tokenId: appointment.token_id } })}
                        className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Track Status
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
