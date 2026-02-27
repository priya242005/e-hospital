import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import axios from 'axios';

const TokenConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tokenData, priority } = location.state || {};
  const [hospitalName, setHospitalName] = useState('');
  const [doctorName, setDoctorName] = useState('');

  useEffect(() => {
    if (tokenData) {
      fetchDetails();
    }
  }, [tokenData]);

  const fetchDetails = async () => {
    try {
      const [hospitalRes, doctorRes] = await Promise.all([
        axios.get(`http://localhost:8000/hospitals/${tokenData.doctor_id.split('/')[0]}`).catch(() => null),
        axios.get(`http://localhost:8000/doctors/${tokenData.doctor_id}`)
      ]);
      
      if (doctorRes?.data) {
        setDoctorName(doctorRes.data.name);
        if (hospitalRes?.data) {
          setHospitalName(hospitalRes.data.hospital_name || hospitalRes.data.name);
        }
      }
    } catch (error) {
      console.error('Failed to fetch details:', error);
    }
  };

  if (!tokenData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No token data available</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-full mb-4">
              ✓ Booking Confirmed
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Your Token</h2>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Token Number</p>
              <p className="text-5xl font-bold text-blue-600">
                {tokenData.token_id}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {doctorName && (
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600">Doctor</span>
                <span className="font-semibold">{doctorName}</span>
              </div>
            )}

            {hospitalName && (
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600">Hospital</span>
                <span className="font-semibold">{hospitalName}</span>
              </div>
            )}

            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-gray-600">Priority</span>
              <StatusBadge status={priority} />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              <StatusBadge status="waiting" />
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/my-appointments')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              View My Appointments
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenConfirmation;
