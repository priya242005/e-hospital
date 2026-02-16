import { useState } from 'react';
import axios from 'axios';

export default function WaitingTime() {
  const [tokenNumber, setTokenNumber] = useState('');
  const [waitingData, setWaitingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkWaitingTime = async () => {
    if (!tokenNumber) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`http://localhost:8000/opd/waiting-time/${tokenNumber}`);
      setWaitingData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Token not found');
      setWaitingData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Check Waiting Time</h2>
        
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter your token number"
            value={tokenNumber}
            onChange={(e) => setTokenNumber(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={checkWaitingTime}
            disabled={loading || !tokenNumber}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Checking...' : 'Check'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {waitingData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">⏱️</div>
            <h3 className="text-xl font-bold text-gray-800">Your Queue Status</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">Token Number</p>
              <p className="text-2xl font-bold text-blue-600">{waitingData.token_number}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="text-xl font-semibold text-green-700 capitalize">{waitingData.status}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Patients Ahead</span>
              <span className="font-bold text-lg">{waitingData.patients_ahead}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Expected Wait Time</span>
              <span className="font-bold text-lg text-orange-600">{waitingData.estimated_wait_minutes} mins</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Assigned Doctor</span>
              <span className="font-semibold">{waitingData.assigned_doctor}</span>
            </div>
          </div>

          <button
            onClick={checkWaitingTime}
            className="w-full mt-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
          >
            🔄 Refresh Status
          </button>
        </div>
      )}
    </div>
  );
}
