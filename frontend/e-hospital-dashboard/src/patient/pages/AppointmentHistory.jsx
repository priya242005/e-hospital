import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import patientApi from '../services/patientApi';
import StatusBadge from '../components/StatusBadge';

const AppointmentHistory = () => {
  const [historyAppointments, setHistoryAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await patientApi.getUserAppointments(user.user_id);
      
      const today = new Date().toISOString().split('T')[0];
      
      const history = response.data.filter(apt => 
        apt.appointment_date !== today || apt.token_status === 'completed'
      ).sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
      
      setHistoryAppointments(history);
    } catch (error) {
      console.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/')} className="mb-4 text-blue-600 hover:underline">
          ← Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Appointment History</h2>
            <p className="text-blue-100 mt-2">View your past appointments</p>
          </div>

          <div className="p-6">
            {historyAppointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No appointment history</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyAppointments.map((appointment) => (
                  <div
                    key={appointment.token_id || appointment.appointment_id}
                    className="border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-lg transition"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                            Token: {appointment.token_id || 'N/A'}
                          </h3>
                          <StatusBadge status={appointment.token_status || appointment.status} />
                          <StatusBadge status={appointment.priority} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                          <div>
                            <p className="text-sm text-gray-600">Patient</p>
                            <p className="font-medium">{appointment.patient_name || 'N/A'}</p>
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
                            <p className="font-medium">{appointment.appointment_date || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentHistory;
