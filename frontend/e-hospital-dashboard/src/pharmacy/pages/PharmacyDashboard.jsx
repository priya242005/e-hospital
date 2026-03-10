import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import StatCard from '../../ui/StatCard';
import TableCard from '../../ui/TableCard';
import StatusBadge from '../../ui/StatusBadge';

const PharmacyDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hospitalId, setHospitalId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.user_id || userData.role !== 'pharmacy_admin') {
      navigate('/pharmacy/login');
      return;
    }
    setUser(userData);
    
    // For now, use first hospital - in production, link pharmacy to hospital
    fetchPharmacyData('hospital_1');
  }, []);

  const fetchPharmacyData = async (hId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [queueRes, inventoryRes, analyticsRes] = await Promise.all([
        axios.get(`http://localhost:8000/pharmacy/queue/${hId}`, { headers }),
        axios.get(`http://localhost:8000/pharmacy/inventory/${hId}`, { headers }),
        axios.get(`http://localhost:8000/pharmacy/analytics/${hId}`, { headers })
      ]);

      setQueue(queueRes.data);
      setInventory(inventoryRes.data);
      setAnalytics(analyticsRes.data);
      setHospitalId(hId);
    } catch (error) {
      console.error('Failed to fetch pharmacy data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (prescriptionId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/pharmacy/queue/${prescriptionId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPharmacyData(hospitalId);
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/pharmacy/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Prepare chart data
  const demandData = analytics?.daily_usage ? Object.entries(analytics.daily_usage).map(([name, value]) => ({
    name,
    usage: value
  })) : [];

  const lowStockItems = inventory.filter(item => item.stock_quantity < item.minimum_threshold);
  const expiredItems = inventory.filter(item => new Date(item.expiry_date) < new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0b1f3a] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Pharmacy Dashboard</h1>
              <p className="text-blue-200 text-sm mt-1">Welcome, {user?.name}</p>
            </div>
            <button onClick={handleLogout} className="bg-white text-[#0b1f3a] px-6 py-2 rounded-lg hover:bg-gray-100 transition font-medium">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Overview Stats */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Medicines" value={inventory.length} icon="💊" color="blue" />
            <StatCard title="Low Stock" value={lowStockItems.length} icon="⚠️" color="yellow" />
            <StatCard title="Expired" value={expiredItems.length} icon="🚫" color="red" />
            <StatCard title="Queue" value={queue.length} icon="📋" color="green" />
          </div>
        </section>

        {/* Pharmacy Queue */}
        <section>
          <TableCard title="Pharmacy Queue">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Prescription ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Token</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Medicines</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Est. Wait</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => (
                  <tr key={item.prescription_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{item.prescription_id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm font-bold">{item.pharmacy_token}</td>
                    <td className="px-4 py-3 text-sm">{item.medicine_list?.join(', ') || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                        item.status === 'ready' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.estimated_wait_time} min</td>
                    <td className="px-4 py-3 space-x-2">
                      {item.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(item.prescription_id, 'ready')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition"
                        >
                          Mark Ready
                        </button>
                      )}
                      {item.status === 'ready' && (
                        <button
                          onClick={() => handleUpdateStatus(item.prescription_id, 'collected')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                        >
                          Collected
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
        </section>

        {/* Inventory Management */}
        <section>
          <TableCard title="Inventory Management">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Medicine Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Threshold</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const isLowStock = item.stock_quantity < item.minimum_threshold;
                  const isExpired = new Date(item.expiry_date) < new Date();
                  
                  return (
                    <tr key={item.medicine_id} className={`border-t hover:bg-gray-50 ${isExpired ? 'bg-red-50' : isLowStock ? 'bg-yellow-50' : ''}`}>
                      <td className="px-4 py-3 text-sm font-semibold">{item.medicine_name}</td>
                      <td className="px-4 py-3 text-sm">{item.stock_quantity}</td>
                      <td className="px-4 py-3 text-sm">{item.minimum_threshold}</td>
                      <td className="px-4 py-3 text-sm">{item.expiry_date}</td>
                      <td className="px-4 py-3">
                        {isExpired ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">EXPIRED</span>
                        ) : isLowStock ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">LOW STOCK</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">GOOD</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableCard>
        </section>

        {/* Demand Analytics */}
        <section>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Medicine Demand Analytics</h3>
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
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {med}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PharmacyDashboard;
