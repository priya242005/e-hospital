import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import patientApi from '../services/patientApi';
import StatusBadge from '../components/StatusBadge';

const WaitingTime = () => {
  const [tokenNumber, setTokenNumber] = useState('');
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.tokenNumber) {
      setTokenNumber(location.state.tokenNumber);
      fetchQueueData(location.state.tokenNumber);
    }
  }, [location.state]);

  useEffect(() => {
    if (queueData) {
      const interval = setInterval(() => {
        fetchQueueData(tokenNumber);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [queueData, tokenNumber]);

  const fetchQueueData = async (token) => {
    setLoading(true);
    setError('');
    try {
      const response = await patientApi.getOPDQueue(token);
      const data = response.data;
      
      const patientsAhead = data.queue_position || 0;
      const avgConsultTime = 15;
      const waitingTime = patientsAhead * avgConsultTime;

      setQueueData({
        ...data,
        patientsAhead,
        estimatedTime: waitingTime
      });
    } catch (error) {
      setError('Failed to fetch queue data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQueueData(tokenNumber);
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Track Waiting Time</h2>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={tokenNumber}
                onChange={(e) => setTokenNumber(e.target.value)}
                placeholder="Enter Token Number"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Loading...' : 'Search'}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {queueData && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Doctor</p>
                    <p className="font-semibold text-lg">{queueData.doctor_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Status</p>
                    <StatusBadge status={queueData.status} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm mb-1">Patients Ahead</p>
                  <p className="text-3xl font-bold text-yellow-700">{queueData.patientsAhead}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm mb-1">Estimated Time</p>
                  <p className="text-3xl font-bold text-green-700">{queueData.estimatedTime} min</p>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500 mt-4">
                Auto-refreshing every 30 seconds
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingTime;
