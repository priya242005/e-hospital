import { useState, useEffect } from 'react';
import axios from 'axios';

export default function BedAvailability() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/beds/status');
      setBeds(response.data);
    } catch (err) {
      setError('Failed to load bed availability');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'green': return 'bg-green-100 border-green-500 text-green-800';
      case 'yellow': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'red': return 'bg-red-100 border-red-500 text-red-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'green': return '🟢';
      case 'yellow': return '🟡';
      case 'red': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'green': return 'Beds Available';
      case 'yellow': return 'Limited Availability';
      case 'red': return 'No Beds Available';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Loading bed availability...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Hospital Bed Availability</h2>
            <p className="text-gray-600">Real-time bed status across hospitals</p>
          </div>
          <button
            onClick={fetchBeds}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beds.map((bed, idx) => (
          <div
            key={idx}
            className={`border-2 rounded-lg p-6 ${getStatusColor(bed.status)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg mb-1">{bed.hospital}</h3>
                <p className="text-sm opacity-75">{bed.city}</p>
              </div>
              <div className="text-3xl">{getStatusIcon(bed.status)}</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Beds</span>
                <span className="font-bold">{bed.total_beds}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Available</span>
                <span className="font-bold">{bed.available_beds}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Occupied</span>
                <span className="font-bold">{bed.occupied_beds}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-current opacity-50">
              <p className="text-center font-semibold text-sm">
                {getStatusText(bed.status)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {beds.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🏥</div>
          <p className="text-gray-600">No bed data available</p>
        </div>
      )}
    </div>
  );
}
