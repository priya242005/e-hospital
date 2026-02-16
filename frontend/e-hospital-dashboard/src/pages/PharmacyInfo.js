import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PharmacyInfo() {
  const [medicines, setMedicines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPharmacyData();
  }, []);

  const fetchPharmacyData = async () => {
    setLoading(true);
    try {
      const [medicinesRes, alertsRes] = await Promise.all([
        axios.get('http://localhost:8000/pharmacy/stock'),
        axios.get('http://localhost:8000/admin/pharmacy-alerts')
      ]);
      setMedicines(medicinesRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      console.error('Failed to load pharmacy data');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(med =>
    med.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50' };
    if (quantity < 50) return { text: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-50' };
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Loading pharmacy information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pharmacy Information</h2>
        <p className="text-gray-600">Check medicine availability across hospitals</p>
      </div>

      {alerts.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded">
          <h3 className="font-bold text-orange-800 mb-2">⚠️ Low Stock Alerts</h3>
          <ul className="space-y-1">
            {alerts.map((alert, idx) => (
              <li key={idx} className="text-sm text-orange-700">
                • {alert.medicine_name} at {alert.hospital} - Only {alert.quantity} units left
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <input
          type="text"
          placeholder="Search medicine by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedicines.map((med, idx) => {
          const status = getStockStatus(med.quantity);
          return (
            <div key={idx} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{med.medicine_name}</h3>
                  <p className="text-sm text-gray-600">{med.hospital}</p>
                </div>
                <div className="text-2xl">💊</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-semibold">{med.quantity} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold">₹{med.price}</span>
                </div>
              </div>

              <div className={`mt-3 pt-3 border-t ${status.bg} -mx-4 -mb-4 px-4 py-2 rounded-b-lg`}>
                <p className={`text-center font-semibold text-sm ${status.color}`}>
                  {status.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMedicines.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-600">No medicines found</p>
        </div>
      )}
    </div>
  );
}
