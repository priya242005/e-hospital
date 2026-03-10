import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PharmacyLogin = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', license_number: '', pharmacy_name: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await axios.post('http://localhost:8000/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: 'pharmacy_admin',
          license_number: formData.license_number,
          pharmacy_name: formData.pharmacy_name,
          address: formData.address
        });
        alert('Registration successful! Please login.');
        setIsRegister(false);
        setFormData({ name: '', email: '', password: '', phone: '', license_number: '', pharmacy_name: '', address: '' });
      } else {
        const response = await axios.post('http://localhost:8000/auth/login', {
          email: formData.email,
          password: formData.password
        });

        const { access_token, user } = response.data;
        
        if (user.role !== 'pharmacy_admin') {
          setError('Invalid credentials for pharmacy login');
          return;
        }

        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/pharmacy/dashboard');
      }
    } catch (err) {
      setError(isRegister ? 'Registration failed. Email may already exist.' : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💊</div>
          <h1 className="text-3xl font-bold text-gray-800">{isRegister ? 'Pharmacy Registration' : 'Pharmacy Login'}</h1>
          <p className="text-gray-600 mt-2">{isRegister ? 'Register your pharmacy' : 'Access pharmacy management'}</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacy Name</label>
                <input
                  type="text"
                  value={formData.pharmacy_name}
                  onChange={(e) => setFormData({ ...formData, pharmacy_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="2"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 font-medium"
          >
            {loading ? (isRegister ? 'Registering...' : 'Logging in...') : (isRegister ? 'Register' : 'Login')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-green-600 hover:underline font-medium"
          >
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:underline font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PharmacyLogin;
