import { useEffect, useState } from "react";
import AdminAPI from "../services/adminApi";

export default function AnalyticsDashboard() {
  const [beds, setBeds] = useState([]);
  const [opdData, setOpdData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bedRes, opdRes] = await Promise.all([
        AdminAPI.get("/beds"),
        AdminAPI.get("/opd")
      ]);
      setBeds(bedRes.data);
      setOpdData(opdRes.data);
    } catch (error) {
      console.error("Analytics Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalBeds = beds.reduce((sum, b) => sum + (b.total_beds || 0), 0);
  const occupiedBeds = beds.reduce((sum, b) => sum + (b.occupied_beds || 0), 0);
  const availableBeds = beds.reduce((sum, b) => sum + (b.available_beds || 0), 0);
  const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0;

  const todayAppointments = opdData.length;
  const waitingPatients = opdData.filter(o => o.status === "waiting").length;
  const completedPatients = opdData.filter(o => o.status === "completed").length;

  if (loading) return <p className="p-6">Loading analytics...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🛏️</span> Bed Occupancy Analytics
          </h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Beds</p>
              <p className="text-3xl font-bold text-blue-600">{totalBeds}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-3xl font-bold text-red-600">{occupiedBeds}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-3xl font-bold text-green-600">{availableBeds}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Occupancy Rate</span>
              <span className="text-sm font-bold text-gray-900">{occupancyRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  occupancyRate > 90 ? 'bg-red-500' :
                  occupancyRate > 70 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            {beds.map((bed, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">{bed.hospital_id}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{bed.occupied_beds}/{bed.total_beds}</span>
                  <span className={`w-3 h-3 rounded-full ${
                    bed.status === 'green' ? 'bg-green-500' :
                    bed.status === 'yellow' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">📋</span> Appointment Booking Analytics
          </h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Today's Total</p>
              <p className="text-3xl font-bold text-purple-600">{todayAppointments}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Waiting</p>
              <p className="text-3xl font-bold text-orange-600">{waitingPatients}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedPatients}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Completion Rate</span>
              <span className="text-sm font-bold text-gray-900">
                {todayAppointments > 0 ? ((completedPatients / todayAppointments) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${todayAppointments > 0 ? (completedPatients / todayAppointments) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border-l-4 border-red-500">
              <p className="text-sm text-gray-600">Emergency Priority</p>
              <p className="text-2xl font-bold text-red-600">
                {opdData.filter(o => o.priority === 'emergency').length}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-l-4 border-orange-500">
              <p className="text-sm text-gray-600">Elder Priority</p>
              <p className="text-2xl font-bold text-orange-600">
                {opdData.filter(o => o.priority === 'elder').length}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Normal Priority</p>
              <p className="text-2xl font-bold text-blue-600">
                {opdData.filter(o => o.priority === 'normal').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
