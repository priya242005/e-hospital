import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import patientApi from '../services/patientApi';
import HospitalSelector from '../components/HospitalSelector';
import PrioritySelector from '../components/PrioritySelector';

const OPDBooking = () => {
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    hospitalId: '',
    department: '',
    doctorId: '',
    priority: '',
    autoAssign: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchHospitals();
    fetchPatients();
    if (location.state?.hospitalId) {
      setFormData(prev => ({ ...prev, hospitalId: location.state.hospitalId }));
    }
  }, [location.state]);

  useEffect(() => {
    if (formData.hospitalId) {
      fetchDepartments(formData.hospitalId);
    }
  }, [formData.hospitalId]);

  useEffect(() => {
    if (formData.hospitalId && formData.department) {
      fetchDoctors(formData.hospitalId, formData.department);
    }
  }, [formData.hospitalId, formData.department]);

  const fetchHospitals = async () => {
    try {
      const response = await patientApi.getHospitals();
      setHospitals(response.data);
    } catch (error) {
      setError('Failed to load hospitals');
    }
  };

  const fetchPatients = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await patientApi.getPatients(user.user_id);
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to load patients');
    }
  };

  const fetchDepartments = async (hospitalId) => {
    try {
      const response = await patientApi.getDepartments(hospitalId);
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to load departments');
    }
  };

  const fetchDoctors = async (hospitalId, department) => {
    try {
      const response = await patientApi.getDoctors(hospitalId, department);
      setDoctors(response.data);
    } catch (error) {
      console.error('Failed to load doctors');
      setDoctors([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      const opdData = {
        user_id: user.user_id,
        patient_id: formData.patientId,
        hospital_id: formData.hospitalId,
        department: formData.department,
        doctor_id: formData.autoAssign ? null : formData.doctorId,
        priority: formData.priority,
        auto_assign: formData.autoAssign
      };

      const response = await patientApi.createOPDQueue(opdData);
      
      navigate('/token-confirmation', {
        state: {
          tokenData: response.data,
          priority: formData.priority
        }
      });
    } catch (error) {
      setError('Failed to book OPD. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Book OPD Appointment</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {patients.length === 0 && (
            <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg mb-4">
              No patients found. <button onClick={() => navigate('/add-patient')} className="underline font-medium">Add a patient first</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose patient</option>
                {patients.map((patient) => (
                  <option key={patient.patient_id} value={patient.patient_id}>
                    {patient.name} ({patient.age}y, {patient.gender})
                  </option>
                ))}
              </select>
            </div>

            <HospitalSelector
              hospitals={hospitals}
              value={formData.hospitalId}
              onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value, doctorId: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={!formData.hospitalId}
              >
                <option value="">Choose department</option>
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required={!formData.autoAssign}
                disabled={!formData.department || formData.autoAssign}
              >
                <option value="">Choose doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.doctor_id} value={doctor.doctor_id}>
                    {doctor.name} - {doctor.department}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoAssign"
                checked={formData.autoAssign}
                onChange={(e) => setFormData({ ...formData, autoAssign: e.target.checked, doctorId: '' })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="autoAssign" className="ml-2 text-sm text-gray-700">
                Auto-assign doctor (system will assign least loaded doctor)
              </label>
            </div>

            <PrioritySelector
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            />

            <button
              type="submit"
              disabled={loading || patients.length === 0 || (!formData.autoAssign && !formData.doctorId)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OPDBooking;
