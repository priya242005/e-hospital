import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API = 'http://localhost:8000';

const PRIORITY_COLOR = {
  critical: 'border-red-500 bg-red-50',
  high: 'border-orange-500 bg-orange-50',
  medium: 'border-yellow-500 bg-yellow-50',
};

const PharmacyDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hospitalId, setHospitalId] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [addForm, setAddForm] = useState({ medicine_name: '', stock_quantity: '', minimum_threshold: '', expiry_date: '', price_per_unit: '' });
  const [addError, setAddError] = useState('');

  const [billTarget, setBillTarget] = useState(null);
  const [billQty, setBillQty] = useState('');
  const [billResult, setBillResult] = useState(null);
  const [billError, setBillError] = useState('');

  const [seeding, setSeeding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.user_id || userData.role !== 'pharmacy_admin') {
      navigate('/pharmacy/login');
      return;
    }
    setUser(userData);
    const hId = userData.hospital_id;
    if (!hId) {
      alert('No hospital linked to this pharmacy account. Contact hospital admin.');
      setLoading(false);
      return;
    }
    setHospitalId(hId);
    fetchAll(hId);
  }, []);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchAll = async (hId) => {
    try {
      const [invRes, alertRes, analyticsRes] = await Promise.all([
        axios.get(`${API}/pharmacy/inventory/${hId}`, { headers: headers() }),
        axios.get(`${API}/pharmacy/alerts/${hId}`),
        axios.get(`${API}/pharmacy/analytics/${hId}`, { headers: headers() }),
      ]);
      setInventory(invRes.data);
      setAlerts(alertRes.data);
      setAnalytics(analyticsRes.data);
    } catch (e) {
      console.error('fetchAll error:', e.response?.status, e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setAddError('');
    try {
      await axios.post(
        `${API}/pharmacy/inventory?hospital_id=${hospitalId}`,
        {
          medicine_name: addForm.medicine_name,
          stock_quantity: parseInt(addForm.stock_quantity),
          minimum_threshold: parseInt(addForm.minimum_threshold),
          expiry_date: addForm.expiry_date,
          price_per_unit: parseFloat(addForm.price_per_unit) || 0,
        },
        { headers: headers() }
      );
      setAddForm({ medicine_name: '', stock_quantity: '', minimum_threshold: '', expiry_date: '', price_per_unit: '' });
      fetchAll(hospitalId);
      setActiveTab('inventory');
    } catch (e) {
      setAddError(e.response?.data?.detail || 'Failed to add medicine');
    }
  };

  const handleDelete = async (medicineId) => {
    if (!window.confirm('Delete this medicine?')) return;
    try {
      await axios.delete(`${API}/pharmacy/inventory/${medicineId}`, { headers: headers() });
      fetchAll(hospitalId);
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to delete');
    }
  };

  const openBill = (item) => {
    setBillTarget(item);
    setBillQty('');
    setBillResult(null);
    setBillError('');
  };

  const handleBill = async () => {
    setBillError('');
    setBillResult(null);
    try {
      const res = await axios.post(
        `${API}/pharmacy/inventory/${billTarget.medicine_id}/bill`,
        { quantity: parseInt(billQty) },
        { headers: headers() }
      );
      setBillResult(res.data);
      fetchAll(hospitalId);
    } catch (e) {
      setBillError(e.response?.data?.detail || 'Billing failed');
    }
  };

  const handleSeed = async () => {
    if (!window.confirm(`Seed test medicines for hospital "${hospitalId}"?`)) return;
    setSeeding(true);
    try {
      const res = await axios.post(`${API}/pharmacy/seed/${hospitalId}`);
      alert(`✅ ${res.data.message}`);
      fetchAll(hospitalId);
    } catch (e) {
      alert('Seed failed: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSeeding(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/pharmacy/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading...</div>;

  const lowStock = inventory.filter(i => i.stock_quantity < i.minimum_threshold);
  const expired = inventory.filter(i => new Date(i.expiry_date) < new Date());
  const demandData = analytics?.daily_usage
    ? Object.entries(analytics.daily_usage).map(([name, usage]) => ({ name, usage }))
    : [];

  const navItems = [
    { id: 'inventory', icon: '💊', label: 'Inventory' },
    { id: 'add', icon: '➕', label: 'Add Medicine' },
    { id: 'alerts', icon: '🔔', label: `Alerts${alerts.length ? ` (${alerts.length})` : ''}` },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-[#0b1f3a] text-white ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-blue-800">
          <h2 className={`font-bold ${sidebarOpen ? 'text-lg' : 'text-xs text-center'}`}>
            {sidebarOpen ? '💊 Pharmacy' : 'P'}
          </h2>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full px-4 py-3 text-left hover:bg-blue-900 transition ${activeTab === item.id ? 'bg-blue-900 border-l-4 border-white' : ''}`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-4 border-t border-blue-800 hover:bg-blue-900">
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#0b1f3a]">Pharmacy Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name} • <span className="text-green-600">● Live</span></p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold text-sm disabled:opacity-60"
            >
              {seeding ? 'Seeding...' : '🌱 Seed Test Data'}
            </button>
            <button onClick={() => fetchAll(hospitalId)} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 font-semibold text-sm">
              🔄 Refresh
            </button>
            <button onClick={handleLogout} className="bg-[#0b1f3a] text-white px-6 py-2 rounded-lg hover:bg-blue-900">Logout</button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Medicines', value: inventory.length, icon: '💊', color: 'text-blue-600' },
              { label: 'Low Stock', value: lowStock.length, icon: '⚠️', color: 'text-yellow-600' },
              { label: 'Expired', value: expired.length, icon: '🚫', color: 'text-red-600' },
              { label: 'Active Alerts', value: alerts.length, icon: '🔔', color: 'text-orange-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="text-gray-600 text-sm">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Medicine Inventory</h2>
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0b1f3a] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs">Medicine</th>
                      <th className="px-4 py-3 text-left text-xs">Stock</th>
                      <th className="px-4 py-3 text-left text-xs">Threshold</th>
                      <th className="px-4 py-3 text-left text-xs">Expiry</th>
                      <th className="px-4 py-3 text-left text-xs">Price (₹)</th>
                      <th className="px-4 py-3 text-left text-xs">Status</th>
                      <th className="px-4 py-3 text-left text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => {
                      const isLow = item.stock_quantity < item.minimum_threshold;
                      const isExp = new Date(item.expiry_date) < new Date();
                      const isOut = item.stock_quantity === 0;
                      return (
                        <tr key={item.medicine_id} className={`border-t hover:bg-gray-50 ${isExp ? 'bg-red-50' : isOut ? 'bg-red-50' : isLow ? 'bg-yellow-50' : ''}`}>
                          <td className="px-4 py-3 text-sm font-semibold">{item.medicine_name}</td>
                          <td className="px-4 py-3 text-sm">{item.stock_quantity}</td>
                          <td className="px-4 py-3 text-sm">{item.minimum_threshold}</td>
                          <td className="px-4 py-3 text-sm">{item.expiry_date}</td>
                          <td className="px-4 py-3 text-sm">₹{item.price_per_unit}</td>
                          <td className="px-4 py-3">
                            {isExp ? (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">EXPIRED</span>
                            ) : isOut ? (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">OUT OF STOCK</span>
                            ) : isLow ? (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">LOW STOCK</span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">GOOD</span>
                            )}
                          </td>
                          <td className="px-4 py-3 flex gap-2">
                            <button
                              onClick={() => openBill(item)}
                              disabled={isOut || isExp}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-40"
                            >
                              Bill
                            </button>
                            <button
                              onClick={() => handleDelete(item.medicine_id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {inventory.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-8 text-gray-400">No medicines. Use "Seed Test Data" or add manually.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add Medicine Tab */}
          {activeTab === 'add' && (
            <div className="max-w-lg space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Add New Medicine</h2>
              <div className="bg-white rounded-xl shadow p-6">
                {addError && <div className="bg-red-50 text-red-700 px-4 py-2 rounded mb-4 text-sm">{addError}</div>}
                <form onSubmit={handleAddMedicine} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Medicine Name</label>
                    <input required value={addForm.medicine_name} onChange={e => setAddForm({ ...addForm, medicine_name: e.target.value })}
                      className="w-full border rounded px-3 py-2" placeholder="e.g. Paracetamol 500mg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Stock Quantity</label>
                      <input required type="number" min="0" value={addForm.stock_quantity} onChange={e => setAddForm({ ...addForm, stock_quantity: e.target.value })}
                        className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Min Threshold</label>
                      <input required type="number" min="1" value={addForm.minimum_threshold} onChange={e => setAddForm({ ...addForm, minimum_threshold: e.target.value })}
                        className="w-full border rounded px-3 py-2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Expiry Date</label>
                      <input required type="date" value={addForm.expiry_date} onChange={e => setAddForm({ ...addForm, expiry_date: e.target.value })}
                        className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Price per Unit (₹)</label>
                      <input type="number" min="0" step="0.01" value={addForm.price_per_unit} onChange={e => setAddForm({ ...addForm, price_per_unit: e.target.value })}
                        className="w-full border rounded px-3 py-2" placeholder="0.00" />
                    </div>
                  </div>
                  {addForm.stock_quantity && addForm.minimum_threshold && parseInt(addForm.stock_quantity) < parseInt(addForm.minimum_threshold) && (
                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-xs px-3 py-2 rounded">
                      ⚠️ Stock is below threshold — a low-stock alert will be created automatically.
                    </div>
                  )}
                  <button type="submit" className="w-full bg-[#0b1f3a] text-white py-3 rounded-lg hover:bg-blue-900 font-semibold">
                    Add Medicine
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Pharmacy Alerts</h2>
              {alerts.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
                  <div className="text-4xl mb-2">✅</div>
                  No active alerts — all stock levels are healthy.
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert, idx) => (
                    <div key={idx} className={`border-l-4 px-4 py-3 rounded-lg ${PRIORITY_COLOR[alert.priority] || 'bg-gray-100 border-gray-400'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-gray-800">
                            {alert.type === 'out_of_stock' ? '🚫' : alert.type === 'low_stock' ? '⚠️' : alert.type === 'expired' ? '☠️' : '⏰'}
                            {' '}{alert.medicine_name}
                          </p>
                          <p className="text-sm mt-0.5 text-gray-600">{alert.message}</p>
                          {alert.stock !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">Stock: {alert.stock} units / Min threshold: {alert.threshold} units</p>
                          )}
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                          alert.priority === 'critical' ? 'bg-red-600 text-white' :
                          alert.priority === 'high' ? 'bg-orange-500 text-white' :
                          'bg-yellow-400 text-yellow-900'
                        }`}>{alert.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Medicine Demand Analytics</h2>
              <div className="bg-white rounded-xl shadow p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={demandData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="usage" fill="#3b82f6" name="Daily Usage" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Most Used Medicines</h4>
                  <div className="flex flex-wrap gap-2">
                    {analytics?.most_used_medicines?.map((med, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{med}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bill Modal */}
      {billTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-1">Bill Medicine</h3>
            <p className="text-sm text-gray-500 mb-4">
              {billTarget.medicine_name} — Expiry: <span className="font-semibold">{billTarget.expiry_date}</span>
            </p>
            <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-600">Available Stock</span><span className="font-bold">{billTarget.stock_quantity} units</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Price per Unit</span><span className="font-bold">₹{billTarget.price_per_unit}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Min Threshold</span><span className="font-bold">{billTarget.minimum_threshold} units</span></div>
            </div>
            {!billResult ? (
              <>
                <label className="block text-sm font-semibold mb-1">Quantity to Bill</label>
                <input
                  type="number" min="1" max={billTarget.stock_quantity}
                  value={billQty} onChange={e => setBillQty(e.target.value)}
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder={`Max: ${billTarget.stock_quantity}`}
                />
                {billQty && (
                  <p className="text-sm text-gray-600 mb-3">
                    Total: <span className="font-bold text-green-700">₹{(parseInt(billQty) * billTarget.price_per_unit).toFixed(2)}</span>
                  </p>
                )}
                {billError && <p className="text-red-600 text-sm mb-3">{billError}</p>}
                <div className="flex gap-2">
                  <button onClick={handleBill} disabled={!billQty || parseInt(billQty) < 1}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-40">
                    Confirm Bill
                  </button>
                  <button onClick={() => setBillTarget(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-semibold">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-sm space-y-1">
                  <p className="font-bold text-green-800 text-base">✅ Bill Generated</p>
                  <div className="flex justify-between"><span>Medicine</span><span className="font-semibold">{billResult.medicine_name}</span></div>
                  <div className="flex justify-between"><span>Qty Billed</span><span className="font-semibold">{billResult.billed_quantity}</span></div>
                  <div className="flex justify-between"><span>Remaining Stock</span><span className="font-semibold">{billResult.remaining_stock}</span></div>
                  <div className="flex justify-between"><span>Price/Unit</span><span className="font-semibold">₹{billResult.price_per_unit}</span></div>
                  <div className="flex justify-between text-base font-bold text-green-800 border-t pt-2 mt-2">
                    <span>Total Amount</span><span>₹{billResult.total_amount}</span>
                  </div>
                </div>
                {billResult.remaining_stock < billTarget.minimum_threshold && (
                  <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-xs px-3 py-2 rounded">
                    ⚠️ Stock now below threshold — alert has been raised.
                  </div>
                )}
                <button onClick={() => setBillTarget(null)} className="w-full bg-[#0b1f3a] text-white py-2 rounded-lg hover:bg-blue-900 font-semibold">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDashboard;
