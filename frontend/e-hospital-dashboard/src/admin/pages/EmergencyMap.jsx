import { useEffect, useState } from "react";
import axios from "axios";
import HospitalMap from "../../public/components/HospitalMap";

const STATUS_COLOR = {
  green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500', label: '✅ BEDS AVAILABLE' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500', label: '⚠️ LIMITED BEDS' },
  red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500', label: '🚫 CRITICAL / FULL' },
};

export default function EmergencyMap({ dark = false }) {
  const [mapHospitals, setMapHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8000/public/hospital-map")
      .then(res => setMapHospitals(res.data || []))
      .catch(err => console.error("Emergency Map Error:", err))
      .finally(() => setLoading(false));
  }, []);

  const bg = dark ? 'bg-gray-900 text-white' : '';
  const card = dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white';
  const subText = dark ? 'text-gray-400' : 'text-gray-500';

  if (loading) return <p className={`p-6 ${dark ? 'text-gray-300' : ''}`}>Loading emergency map...</p>;

  return (
    <div className={`p-6 ${bg}`}>
      <div className="bg-red-600 text-white p-4 rounded-lg mb-6 flex items-center gap-3">
        <span className="text-3xl">🚨</span>
        <div>
          <h1 className="text-2xl font-bold">Emergency Response Map</h1>
          <p className="text-sm">Real-time hospital bed availability for ambulance direction</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mb-4 text-sm">
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-green-600 inline-block"></span> Good Availability (&lt;60% full)</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-yellow-500 inline-block"></span> Limited (60–85% full)</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-red-600 inline-block"></span> Critical (&gt;85% full)</span>
      </div>

      {/* Map */}
      <div className="mb-8">
        <HospitalMap hospitals={mapHospitals} />
      </div>

      {/* Cards below map */}
      {mapHospitals.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mapHospitals.map(h => {
            const s = STATUS_COLOR[h.status] || STATUS_COLOR.red;
            return (
              <div key={h.hospital_id} className={`rounded-xl shadow-lg p-6 border-l-4 ${s.border} ${card}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{h.hospital_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">📍 {h.city}</p>
                    {h.address && <p className="text-xs text-gray-400 mt-1">{h.address}</p>}
                  </div>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${s.bg}`}>
                    <span className={`text-xl font-bold ${s.text}`}>{h.available_beds}</span>
                  </div>
                </div>
                <div className="space-y-1 mb-4 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Total Beds</span><span className="font-bold">{h.total_beds}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Available</span><span className="font-bold text-green-600">{h.available_beds}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Occupied</span><span className="font-bold text-red-600">{h.total_beds - h.available_beds}</span></div>
                </div>
                <div className={`p-2 rounded-lg text-center text-sm font-bold ${s.bg} ${s.text}`}>{s.label}</div>
                {h.contact_number && <p className="text-xs text-center text-gray-500 mt-2">📞 {h.contact_number}</p>}
              </div>
            );
          })}
        </div>
      )}

      {mapHospitals.length === 0 && (
        <p className="text-center text-gray-500 py-8">No hospitals with location data found.</p>
      )}
    </div>
  );
}
