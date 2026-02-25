import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import patientApi from '../services/patientApi';

const PharmacyInfo = () => {
  const [pharmacyQueue, setPharmacyQueue] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPharmacyData();
  }, []);

  const fetchPharmacyData = async () => {
    try {
      const [queueResponse, alertsResponse] = await Promise.all([
        patientApi.getPharmacyQueue(),
        patientApi.getAlerts()
      ]);
      setPharmacyQueue(queueResponse.data);
      setAlerts(alertsResponse.data);
    } catch (error) {
      setError('Failed to load pharmacy information');
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Pharmacy Information</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Prescription Status</h3>
            {pharmacyQueue.length === 0 ? (
              <div className="text-center text-gray-600 py-4">
                No prescriptions in queue
              </div>
            ) : (
              <div className="space-y-3">
                {pharmacyQueue.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Prescription #{item.prescription_id}</p>
                        <p className="text-sm text-gray-600">Patient: {item.patient_id}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Medicine Availability Alerts</h3>
            {alerts.length === 0 ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
                ✓ All medicines are available
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg ${
                    alert.severity === 'high' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    <div className="flex items-start">
                      <span className="text-xl mr-3">⚠</span>
                      <div>
                        <p className="font-semibold">{alert.medicine_name}</p>
                        <p className="text-sm">{alert.message}</p>
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

export default PharmacyInfo;
