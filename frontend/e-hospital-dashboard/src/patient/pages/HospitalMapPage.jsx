import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HospitalMap from '../../public/components/HospitalMap';

const STATUS_CONFIG = {
  green:  { label: 'Available',  badge: 'bg-green-100 text-green-700', bar: 'bg-green-500', border: 'border-green-400' },
  yellow: { label: 'Limited',    badge: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-500', border: 'border-yellow-400' },
  red:    { label: 'Critical',   badge: 'bg-red-100 text-red-700', bar: 'bg-red-500', border: 'border-red-400' },
};

const HospitalMapPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/public/hospital-map');
      setHospitals(res.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const filtered = hospitals.filter(h =>
    !search || h.hospital_name?.toLowerCase().includes(search.toLowerCase()) || h.city?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = { green: 0, yellow: 0, red: 0 };
  hospitals.forEach(h => { if (counts[h.status] !== undefined) counts[h.status]++; });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0b1f3a] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Hospital Map</h1>
            <p className="text-blue-300 text-sm mt-0.5">Real-time bed availability across all hospitals</p>
          </div>
          <button
            onClick={() => navigate('/patient/home')}
            className="text-sm border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition"
          >
            Back
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Legend + summary */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              <span className="text-gray-600">Available <span className="font-semibold text-gray-800">({counts.green})</span></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
              <span className="text-gray-600">Limited <span className="font-semibold text-gray-800">({counts.yellow})</span></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span className="text-gray-600">Critical <span className="font-semibold text-gray-800">({counts.red})</span></span>
            </span>
          </div>
          <button
            onClick={fetchData}
            className="bg-[#0b1f3a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition"
          >
            Refresh
          </button>
        </div>

        {/* Map */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm flex items-center justify-center" style={{ height: '450px' }}>
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#0b1f3a] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Loading map...</p>
            </div>
          </div>
        ) : (
          <HospitalMap hospitals={hospitals} />
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Search by hospital name or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0b1f3a] focus:border-transparent outline-none"
        />

        {/* Hospital cards */}
        {!loading && (
          filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500 text-sm">No hospitals found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(h => {
                const sc = STATUS_CONFIG[h.status] || STATUS_CONFIG.red;
                const pct = h.total_beds > 0 ? Math.round(((h.total_beds - h.available_beds) / h.total_beds) * 100) : 0;
                return (
                  <div key={h.hospital_id} className={`bg-white rounded-xl shadow-sm border-l-4 ${sc.border} p-5`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="font-semibold text-gray-800 text-sm leading-snug">{h.hospital_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{h.city}{h.address ? ` — ${h.address}` : ''}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${sc.badge}`}>{sc.label}</span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      <div className="flex justify-between">
                        <span>Available beds</span>
                        <span className="font-semibold text-green-600">{h.available_beds}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total beds</span>
                        <span className="font-semibold text-gray-700">{h.total_beds}</span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                      <div className={`h-1.5 rounded-full ${sc.bar}`} style={{ width: `${pct}%` }} />
                    </div>

                    {h.contact_number && (
                      <p className="text-xs text-gray-500">{h.contact_number}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default HospitalMapPage;
