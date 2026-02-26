import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import patientApi from '../services/patientApi';

const OPDBooking = () => {
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bookingFor, setBookingFor] = useState('self');
  const [formData, setFormData] = useState({
    patientId: '',
    hospitalId: '',
    departmentId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    priority: 'normal',
    autoAssign: false
  });
  const [loading, setLoading] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
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
    if (formData.hospitalId && formData.departmentId) {
      fetchDoctors(formData.hospitalId, formData.departmentId);
    }
  }, [formData.hospitalId, formData.departmentId]);

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
    setLoadingDepts(true);
    try {
      console.log('Fetching departments for hospital:', hospitalId);
      const response = await patientApi.getDepartments(hospitalId);
      console.log('Departments response:', response.data);
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to load departments:', error);
      setDepartments([]);
    } finally {
      setLoadingDepts(false);
    }
  };

  const fetchDoctors = async (hospitalId, departmentId) => {
    setLoadingDoctors(true);
    try {
      const response = await patientApi.getDoctors(hospitalId, departmentId);
      setDoctors(response.data);
    } catch (error) {
      console.error('Failed to load doctors');
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      let patientId = formData.patientId;
      if (bookingFor === 'self') {
        patientId = user.user_id;
      }
      
      const appointmentData = {
        hospital_id: formData.hospitalId,
        department_id: formData.departmentId,
        doctor_id: formData.autoAssign ? null : formData.doctorId,
        patient_id: patientId,
        family_member_id: null,
        appointment_date: formData.appointmentDate,
        priority: formData.priority
      };

      const response = await patientApi.createAppointment(appointmentData);
      
      navigate('/token-confirmation', {
        state: {
          tokenData: response.data,
          priority: formData.priority
        }
      });
    } catch (error) {
      setError('Failed to book appointment. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-white hover:text-blue-200 transition flex items-center gap-2"
        >
          <span>←</span> Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Book OPD Appointment</h1>
            <p className="text-blue-100">Fill in the details to schedule your consultation</p>
          </div>

          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Booking For Selection */}
              <div className="bg-blue-50 rounded-xl p-6">
                <label className="block text-lg font-semibold text-blue-900 mb-4">Booking For</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setBookingFor('self')}
                    className={`py-4 px-6 rounded-xl font-medium transition ${
                      bookingFor === 'self'
                        ? 'bg-blue-900 text-white shadow-lg'
                        : 'bg-white text-blue-900 border-2 border-blue-200 hover:border-blue-400'
                    }`}
                  >
                    👤 Self
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingFor('family')}
                    className={`py-4 px-6 rounded-xl font-medium transition ${
                      bookingFor === 'family'
                        ? 'bg-blue-900 text-white shadow-lg'
                        : 'bg-white text-blue-900 border-2 border-blue-200 hover:border-blue-400'
                    }`}
                  >
                    👨‍👩‍👧‍👦 Family
                  </button>
                </div>
              </div>

              {/* Family Member Selection */}
              {bookingFor === 'family' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Family Member</label>
                  {patients.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <p className="text-yellow-800 mb-3">No family members added</p>
                      <button
                        type="button"
                        onClick={() => navigate('/add-patient')}
                        className="text-blue-900 font-medium hover:underline"
                      >
                        + Add Family Member
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Choose family member</option>
                      {patients.map((patient) => (
                        <option key={patient.patient_id} value={patient.patient_id}>
                          {patient.name} ({patient.age}y, {patient.gender})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Hospital Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Hospital</label>
                <select
                  value={formData.hospitalId}
                  onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value, departmentId: '', doctorId: '' })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.hospital_id} value={hospital.hospital_id}>
                      {hospital.hospital_name || hospital.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value, doctorId: '' })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!formData.hospitalId || loadingDepts}
                >
                  <option value="">{loadingDepts ? 'Loading departments...' : 'Choose department'}</option>
                  {departments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Doctor</label>
                {!loadingDoctors && doctors.length === 0 && formData.departmentId && (
                  <div className="mb-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                    No doctors available for this department. Please use auto-assign.
                  </div>
                )}
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={!formData.autoAssign}
                  disabled={!formData.departmentId || formData.autoAssign || loadingDoctors}
                >
                  <option value="">{loadingDoctors ? 'Loading doctors...' : 'Choose doctor'}</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.doctor_id} value={doctor.doctor_id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto Assign Checkbox */}
              <div className="flex items-center bg-blue-50 rounded-lg p-4">
                <input
                  type="checkbox"
                  id="autoAssign"
                  checked={formData.autoAssign}
                  onChange={(e) => setFormData({ ...formData, autoAssign: e.target.checked, doctorId: '' })}
                  className="w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="autoAssign" className="ml-3 text-sm font-medium text-gray-700">
                  Auto-assign doctor (system will assign the least loaded doctor)
                </label>
              </div>

              {/* Appointment Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Date</label>
                <input
                  type="date"
                  value={formData.appointmentDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'emergency', label: 'Emergency', color: 'bg-red-500 hover:bg-red-600' },
                    { value: 'elder', label: 'Elder', color: 'bg-orange-500 hover:bg-orange-600' },
                    { value: 'normal', label: 'Normal', color: 'bg-green-500 hover:bg-green-600' }
                  ].map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: priority.value })}
                      className={`py-3 px-4 rounded-lg font-medium text-white transition ${
                        formData.priority === priority.value
                          ? `${priority.color} ring-4 ring-offset-2 ring-blue-300`
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (bookingFor === 'family' && patients.length === 0)}
                className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-800 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Booking...' : '📋 Book Appointment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OPDBooking;
