import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import patientApi from '../services/patientApi';
import StatusBadge from '../components/StatusBadge';

const BedAvailability = () => {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      const response = await patientApi.getBeds();
      setBeds(response.data);
    } catch (error) {
      setError('Failed to load bed availability');
    } finally {
      setLoading(false);
    }
  };

  const getOccupancyStatus = (occupancy) => {
    if (occupancy >= 90) return { status: 'critical', color: 'bg-red-500' };
    if (occupancy >= 70) return { status: 'moderate', color: 'bg-yellow-500' };
    return { status: 'safe', color: 'bg-green-500' };
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
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Bed Availability</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {beds.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              No bed data available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {beds.map((bed) => {
                const occupancy = ((bed.total_beds - bed.available_beds) / bed.total_beds * 100).toFixed(1);
                const { status, color } = getOccupancyStatus(occupancy);

                return (
                  <div key={bed.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg text-gray-800">{bed.hospital_name}</h3>
                      <StatusBadge status={status} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Beds</span>
                        <span className="font-semibold">{bed.total_beds}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Available</span>
                        <span className="font-semibold text-green-600">{bed.available_beds}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Occupancy</span>
                        <span className="font-semibold">{occupancy}%</span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`${color} h-2 rounded-full transition-all`}
                          style={{ width: `${occupancy}%` }}
                        ></div>
                      </div>
                    </div>

                    {occupancy >= 90 && (
                      <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                        ⚠ Beds Full – Try another hospital
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BedAvailability;
