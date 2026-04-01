import { useEffect, useState, useCallback } from "react";
import AdminAPI from "../services/adminApi";

const StatCard = ({ icon, label, value, sub, color, dark }) => {
  const colors = {
    blue:   { light: 'border-blue-500 bg-blue-50 text-blue-700',   dark: 'border-blue-400 bg-blue-900/30 text-blue-300' },
    green:  { light: 'border-green-500 bg-green-50 text-green-700', dark: 'border-green-400 bg-green-900/30 text-green-300' },
    red:    { light: 'border-red-500 bg-red-50 text-red-700',       dark: 'border-red-400 bg-red-900/30 text-red-300' },
    yellow: { light: 'border-yellow-500 bg-yellow-50 text-yellow-700', dark: 'border-yellow-400 bg-yellow-900/30 text-yellow-300' },
    purple: { light: 'border-purple-500 bg-purple-50 text-purple-700', dark: 'border-purple-400 bg-purple-900/30 text-purple-300' },
    orange: { light: 'border-orange-500 bg-orange-50 text-orange-700', dark: 'border-orange-400 bg-orange-900/30 text-orange-300' },
  };
  const c = colors[color] || colors.blue;
  const cls = dark ? c.dark : c.light;
  return (
    <div className={`rounded-xl border-l-4 p-5 shadow-sm ${cls} ${dark ? 'bg-gray-800' : 'bg-white'} transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {sub && <p className={`text-xs mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{sub}</p>}
        </div>
        <span className="text-4xl opacity-80">{icon}</span>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, value, max, color, dark }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const barColor = color === 'red' ? 'bg-red-500' : color === 'yellow' ? 'bg-yellow-500' : color === 'green' ? 'bg-green-500' : 'bg-blue-500';
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className={dark ? 'text-gray-300' : 'text-gray-600'}>{label}</span>
        <span className={`font-bold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{value}/{max}</span>
      </div>
      <div className={`w-full rounded-full h-2 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default function AnalyticsDashboard({ dark }) {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [opdData, setOpdData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const [hospitalRes, doctorRes, bedRes, opdRes] = await Promise.all([
        AdminAPI.get("/hospitals"),
        AdminAPI.get("/doctors"),
        AdminAPI.get("/beds/admin/summary"),
        AdminAPI.get("/opd/"),
      ]);
      setHospitals(hospitalRes.data || []);
      setDoctors(doctorRes.data || []);
      setBeds(bedRes.data || []);
      setOpdData(opdRes.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Computed stats
  const totalBeds = beds.reduce((s, b) => s + (b.total_beds || 0), 0);
  const occupiedBeds = beds.reduce((s, b) => s + (b.occupied_beds || 0), 0);
  const availableBeds = beds.reduce((s, b) => s + (b.available_beds || 0), 0);
  const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0;

  const totalOPD = opdData.length;
  const waiting = opdData.filter(o => o.status === 'waiting').length;
  const completed = opdData.filter(o => o.status === 'completed').length;
  const emergency = opdData.filter(o => o.priority === 'emergency').length;
  const elder = opdData.filter(o => o.priority === 'elder').length;
  const normal = opdData.filter(o => o.priority === 'normal').length;
  const completionRate = totalOPD > 0 ? ((completed / totalOPD) * 100).toFixed(1) : 0;

  const activeDoctors = doctors.filter(d => d.availability === 'available').length;

  const bg = dark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const card = dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const subText = dark ? 'text-gray-400' : 'text-gray-500';
  const headText = dark ? 'text-white' : 'text-gray-800';
  const rowHover = dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const divider = dark ? 'divide-gray-700' : 'divide-gray-100';
  const badgeBg = dark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700';

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${bg}`}>
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">🏥</div>
        <p className={`text-lg ${subText}`}>Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${bg} p-6`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${headText}`}>Admin Dashboard</h1>
          <p className={`text-sm mt-1 ${subText}`}>
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm ${
            refreshing
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard icon="🏥" label="Hospitals" value={hospitals.length} color="blue" dark={dark} />
        <StatCard icon="👨‍⚕️" label="Total Doctors" value={doctors.length} sub={`${activeDoctors} active`} color="green" dark={dark} />
        <StatCard icon="🛏️" label="Total Beds" value={totalBeds} sub={`${availableBeds} available`} color="purple" dark={dark} />
        <StatCard icon="📋" label="Today's OPD" value={totalOPD} sub={`${waiting} waiting`} color="orange" dark={dark} />
        <StatCard icon="✅" label="Completed" value={completed} sub={`${completionRate}% rate`} color="green" dark={dark} />
        <StatCard icon="🚨" label="Emergency" value={emergency} color="red" dark={dark} />
      </div>

      {/* Row 2: Bed Occupancy + OPD Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* Bed Occupancy */}
        <div className={`rounded-2xl border shadow-sm p-6 ${card}`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-lg font-bold ${headText}`}>🛏️ Bed Occupancy</h2>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              occupancyRate > 90 ? 'bg-red-100 text-red-700' :
              occupancyRate > 70 ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>{occupancyRate}% occupied</span>
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total', val: totalBeds, color: dark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700' },
              { label: 'Occupied', val: occupiedBeds, color: dark ? 'bg-red-900/40 text-red-300' : 'bg-red-50 text-red-700' },
              { label: 'Available', val: availableBeds, color: dark ? 'bg-green-900/40 text-green-300' : 'bg-green-50 text-green-700' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                <p className="text-2xl font-bold">{s.val}</p>
                <p className="text-xs mt-0.5 opacity-80">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Overall bar */}
          <div className="mb-5">
            <div className={`w-full rounded-full h-3 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className={`h-3 rounded-full transition-all ${occupancyRate > 90 ? 'bg-red-500' : occupancyRate > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>

          {/* Per-hospital breakdown */}
          <div className={`divide-y ${divider}`}>
            {beds.length === 0 && <p className={`text-sm text-center py-4 ${subText}`}>No bed data</p>}
            {beds.map((b, i) => {
              const pct = b.total_beds > 0 ? ((b.occupied_beds / b.total_beds) * 100).toFixed(0) : 0;
              return (
                <div key={i} className={`py-3 flex items-center justify-between ${rowHover} px-1 rounded`}>
                  <div className="flex-1 min-w-0 mr-3">
                    <p className={`text-sm font-semibold truncate ${headText}`}>{b.hospital_name}</p>
                    <div className={`w-full rounded-full h-1.5 mt-1.5 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-1.5 rounded-full ${b.status === 'red' ? 'bg-red-500' : b.status === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs ${subText}`}>{b.occupied_beds}/{b.total_beds}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${b.status === 'red' ? 'bg-red-500' : b.status === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OPD Analytics */}
        <div className={`rounded-2xl border shadow-sm p-6 ${card}`}>
          <h2 className={`text-lg font-bold mb-5 ${headText}`}>📋 OPD Analytics</h2>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Total Today", val: totalOPD, color: dark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-700' },
              { label: "Waiting", val: waiting, color: dark ? 'bg-orange-900/40 text-orange-300' : 'bg-orange-50 text-orange-700' },
              { label: "Completed", val: completed, color: dark ? 'bg-green-900/40 text-green-300' : 'bg-green-50 text-green-700' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                <p className="text-2xl font-bold">{s.val}</p>
                <p className="text-xs mt-0.5 opacity-80">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Completion bar */}
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-1">
              <span className={subText}>Completion Rate</span>
              <span className={`font-bold ${headText}`}>{completionRate}%</span>
            </div>
            <div className={`w-full rounded-full h-3 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${completionRate}%` }} />
            </div>
          </div>

          {/* Priority breakdown */}
          <h3 className={`text-sm font-semibold mb-3 ${subText} uppercase tracking-wide`}>Priority Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: '🚨 Emergency', val: emergency, total: totalOPD, bar: 'bg-red-500', badge: dark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700' },
              { label: '👴 Elder', val: elder, total: totalOPD, bar: 'bg-orange-500', badge: dark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700' },
              { label: '👤 Normal', val: normal, total: totalOPD, bar: 'bg-blue-500', badge: dark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700' },
            ].map(p => (
              <div key={p.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={headText}>{p.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.badge}`}>{p.val}</span>
                </div>
                <div className={`w-full rounded-full h-2 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className={`h-2 rounded-full ${p.bar}`} style={{ width: `${p.total > 0 ? (p.val / p.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Hospitals table + Doctors summary */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Hospitals table */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
          <div className={`px-6 py-4 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-lg font-bold ${headText}`}>🏥 Hospitals Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}>
                  <th className="px-4 py-3 text-left font-semibold">Hospital</th>
                  <th className="px-4 py-3 text-left font-semibold">City</th>
                  <th className="px-4 py-3 text-center font-semibold">Beds</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${divider}`}>
                {hospitals.length === 0 && (
                  <tr><td colSpan={4} className={`text-center py-8 ${subText}`}>No hospitals found</td></tr>
                )}
                {hospitals.map((h, i) => {
                  const bedInfo = beds.find(b => b.hospital_id === h.hospital_id);
                  return (
                    <tr key={i} className={`${rowHover} transition`}>
                      <td className={`px-4 py-3 font-semibold ${headText}`}>{h.hospital_name}</td>
                      <td className={`px-4 py-3 ${subText}`}>{h.city}</td>
                      <td className={`px-4 py-3 text-center ${subText}`}>
                        {bedInfo ? `${bedInfo.available_beds}/${bedInfo.total_beds}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                          bedInfo?.status === 'red' ? 'bg-red-500' :
                          bedInfo?.status === 'yellow' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Doctors summary */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
          <div className={`px-6 py-4 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-lg font-bold ${headText}`}>👨‍⚕️ Doctors by Hospital</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}>
                  <th className="px-4 py-3 text-left font-semibold">Doctor</th>
                  <th className="px-4 py-3 text-left font-semibold">Specialization</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${divider}`}>
                {doctors.length === 0 && (
                  <tr><td colSpan={3} className={`text-center py-8 ${subText}`}>No doctors found</td></tr>
                )}
                {doctors.slice(0, 10).map((d, i) => (
                  <tr key={i} className={`${rowHover} transition`}>
                    <td className={`px-4 py-3 font-semibold ${headText}`}>{d.name}</td>
                    <td className={`px-4 py-3 ${subText}`}>{d.specialization || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        d.availability === 'available'
                          ? (dark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700')
                          : (dark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700')
                      }`}>
                        {d.availability === 'available' ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {doctors.length > 10 && (
              <p className={`text-xs text-center py-2 ${subText}`}>Showing 10 of {doctors.length} doctors</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
