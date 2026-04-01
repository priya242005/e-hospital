import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import patientApi from '../services/patientApi';

const BedAvailability = () => {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchBeds(); }, []);

  const fetchBeds = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await patientApi.getAllBedsSummary();
      setBeds(res.data || []);
    } catch {
      setError('Failed to load bed availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = beds.filter(b =>
    b.hospital_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totals = beds.reduce((acc, b) => ({
    total: acc.total + (b.total_beds || 0),
    available: acc.available + (b.available_beds || 0),
    occupied: acc.occupied + (b.occupied_beds || 0),
  }), { total: 0, available: 0, occupied: 0 });

  const statusConfig = {
    green:  { label: 'Available',  cls: 'bg-green-100 text-green-700' },
    yellow: { label: 'Limited',    cls: 'bg-yellow-100 text-yellow-700' },
    red:    { label: 'Critical',   cls: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0b1f3a] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Bed Availability</h1>
            <p className="text-blue-300 text-sm mt-0.5">Real-time status across all hospitals</p>
          </div>
          <button onClick={() => navigate('/patient/home')} className="text-sm border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition">
            Back
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Beds', value: totals.total, cls: 'border-[#0b1f3a] text-[#0b1f3a]' },
            { label: 'Available', value: totals.available, cls: 'border-green-500 text-green-600' },
            { label: 'Occupied', value: totals.occupied, cls: 'border-red-500 text-red-600' },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-xl shadow-sm border-l-4 ${s.cls} p-5`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.cls.split(' ')[1]}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + refresh */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search hospital..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0b1f3a] focus:border-transparent outline-none"
          />
          <button
            onClick={fetchBeds}
            className="bg-[#0b1f3a] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 transition"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="w-8 h-8 border-4 border-[#0b1f3a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading bed data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <p className="text-gray-500">No hospitals found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0b1f3a] text-white">
                  <th className="px-5 py-3.5 text-left font-semibold">Hospital</th>
                  <th className="px-5 py-3.5 text-center font-semibold">Total</th>
                  <th className="px-5 py-3.5 text-center font-semibold">Available</th>
                  <th className="px-5 py-3.5 text-center font-semibold">Occupied</th>
                  <th className="px-5 py-3.5 text-center font-semibold">Occupancy</th>
                  <th className="px-5 py-3.5 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b, i) => {
                  const pct = b.total_beds > 0 ? Math.round((b.occupied_beds / b.total_beds) * 100) : 0;
                  const sc = statusConfig[b.status] || statusConfig.red;
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-semibold text-gray-800">{b.hospital_name}</td>
                      <td className="px-5 py-4 text-center text-gray-600">{b.total_beds}</td>
                      <td className="px-5 py-4 text-center font-semibold text-green-600">{b.available_beds}</td>
                      <td className="px-5 py-4 text-center font-semibold text-red-500">{b.occupied_beds}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${b.status === 'red' ? 'bg-red-500' : b.status === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sc.cls}`}>{sc.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">Data refreshes automatically. Click Refresh for latest status.</p>
      </main>
    </div>
  );
};

export default BedAvailability;
