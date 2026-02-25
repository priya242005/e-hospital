import { useEffect, useState } from "react";
import AdminAPI from "../services/adminApi";

export default function EmergencyMap() {
  const [hospitals, setHospitals] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hospitalRes, bedRes] = await Promise.all([
        AdminAPI.get("/hospitals"),
        AdminAPI.get("/beds")
      ]);
      setHospitals(hospitalRes.data);
      setBeds(bedRes.data);
    } catch (error) {
      console.error("Emergency Map Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHospitalBedStatus = (hospitalId) => {
    return beds.find(b => b.hospital_id === hospitalId);
  };

  if (loading) return <p className="p-6">Loading emergency map...</p>;

  return (
    <div>
      <div className="bg-red-600 text-white p-4 rounded-lg mb-6 flex items-center gap-3">
        <span className="text-3xl">🚨</span>
        <div>
          <h1 className="text-2xl font-bold">Emergency Response Map</h1>
          <p className="text-sm">Real-time hospital bed availability for ambulance direction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => {
          const bedStatus = getHospitalBedStatus(hospital.hospital_id);
          const statusColor = bedStatus?.status === 'green' ? 'green' :
                             bedStatus?.status === 'yellow' ? 'yellow' : 'red';

          return (
            <div
              key={hospital.hospital_id}
              className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                statusColor === 'green' ? 'border-green-500' :
                statusColor === 'yellow' ? 'border-yellow-500' :
                'border-red-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{hospital.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">📍 {hospital.city}</p>
                  {hospital.location && (
                    <p className="text-xs text-gray-500 mt-1">{hospital.location}</p>
                  )}
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  statusColor === 'green' ? 'bg-green-500' :
                  statusColor === 'yellow' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}>
                  <span className="text-white text-2xl font-bold">
                    {bedStatus?.available_beds || 0}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Beds</span>
                  <span className="font-bold">{bedStatus?.total_beds || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available</span>
                  <span className="font-bold text-green-600">{bedStatus?.available_beds || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Occupied</span>
                  <span className="font-bold text-red-600">{bedStatus?.occupied_beds || 0}</span>
                </div>
              </div>

              <div className={`p-3 rounded-lg text-center font-bold ${
                statusColor === 'green' ? 'bg-green-100 text-green-800' :
                statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {statusColor === 'green' ? '✅ BEDS AVAILABLE' :
                 statusColor === 'yellow' ? '⚠️ LIMITED BEDS' :
                 '🚫 NO BEDS'}
              </div>

              {hospital.location && (
                <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                  📍 View on Map
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Legend</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm">Beds Available (&lt;70% occupied)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">Limited Beds (70-90% occupied)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm">No Beds (&gt;90% occupied)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
