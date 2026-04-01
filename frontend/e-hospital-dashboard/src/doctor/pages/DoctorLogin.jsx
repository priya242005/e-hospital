import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/auth/login', formData);
      const { access_token, user } = response.data;

      if (user.role !== 'doctor') {
        setError('Access denied. This portal is for doctors only.');
        return;
      }
      if (!user.doctor_id) {
        setError('No doctor profile linked to this account. Contact hospital admin.');
        return;
      }

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/doctor/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👨‍⚕️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Doctor Portal</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your OPD queue</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 text-white py-3 rounded-lg hover:bg-teal-800 transition font-semibold disabled:bg-gray-400"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button onClick={() => navigate('/')} className="w-full mt-4 text-center text-gray-500 hover:text-gray-700 text-sm">
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default DoctorLogin;
