import { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';

const CredentialsManagement = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCredentials = () => {
    setLoading(true);
    adminApi.getHospitalCredentials()
      .then(res => setCredentials(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCredentials(); }, []);

  const handleSeed = async () => {
    setSeeding(true);
    setMessage('');
    try {
      const res = await adminApi.seedHospitalCredentials();
      setMessage(res.data.message);
      fetchCredentials();
    } catch {
      setMessage('Failed to seed credentials.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">🔑 Hospital Credentials</h1>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="bg-[#0b1f3a] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-900 disabled:opacity-50"
        >
          {seeding ? 'Seeding...' : '⚡ Seed Credentials'}
        </button>
      </div>
      {message && <p className="text-green-600 text-sm bg-green-50 px-4 py-2 rounded-lg">{message}</p>}
      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0b1f3a] text-white">
              <tr>
                {['Hospital', 'City', 'Email', 'Phone', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-sm font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {credentials.map((c, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold">{c.hospital_name}</td>
                  <td className="px-4 py-3 text-sm">{c.city}</td>
                  <td className="px-4 py-3 text-sm font-mono">{c.email}</td>
                  <td className="px-4 py-3 text-sm">{c.phone}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">{c.status || 'active'}</span>
                  </td>
                </tr>
              ))}
              {credentials.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No credentials found. Click "Seed Credentials" to generate.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CredentialsManagement;
