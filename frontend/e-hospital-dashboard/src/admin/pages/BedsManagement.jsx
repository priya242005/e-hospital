import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export default function BedsManagement() {
  const [beds, setBeds] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bedsRes, hospitalsRes] = await Promise.all([
        axios.get(`${API_BASE}/beds`),
        axios.get(`${API_BASE}/hospitals`)
      ]);
      setBeds(bedsRes.data);
      setHospitals(hospitalsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => h.hospital_id === hospitalId);
    return hospital?.hospital_name || 'Unknown Hospital';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'green': return 'bg-green-100 text-green-800 border-green-300';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'red': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const totalBeds = beds.reduce((sum, b) => sum + (b.total_beds || 0), 0);
  const totalAvailable = beds.reduce((sum, b) => sum + (b.available_beds || 0), 0);
  const totalOccupied = totalBeds - totalAvailable;
  const occupancyRate = totalBeds > 0 ? ((totalOccupied / totalBeds) * 100).toFixed(1) : 0;

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bed Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-900">
          <p className="text-gray-500 text-sm font-medium">Total Beds</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{totalBeds}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-700">
          <p className="text-gray-500 text-sm font-medium">Available Beds</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{totalAvailable}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-500">
          <p className="text-gray-500 text-sm font-medium">Occupied Beds</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">{totalOccupied}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-800">
          <p className="text-gray-500 text-sm font-medium">Occupancy Rate</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{occupancyRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beds.map((bed) => (
          <div key={bed.hospital_id} className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-900">
            <h3 className="text-xl font-bold mb-4">{getHospitalName(bed.hospital_id)}</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Beds</span>
                <span className="font-bold text-lg">{bed.total_beds}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available</span>
                <span className="font-bold text-lg text-blue-900">{bed.available_beds}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Occupied</span>
                <span className="font-bold text-lg text-red-600">{bed.total_beds - bed.available_beds}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-600">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(bed.status)}`}>
                  {bed.status?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-blue-900"
                style={{ width: `${((bed.total_beds - bed.available_beds) / bed.total_beds * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {((bed.total_beds - bed.available_beds) / bed.total_beds * 100).toFixed(1)}% Occupied
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
