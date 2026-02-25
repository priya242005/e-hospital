import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import patientApi from '../services/patientApi';
import HospitalSelector from '../components/HospitalSelector';

const Home = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await patientApi.getHospitals();
      setHospitals(response.data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  const menuItems = [
    { title: 'Book OPD', path: '/opd-booking', icon: '📋', color: 'bg-blue-500' },
    { title: 'Check Waiting Time', path: '/waiting-time', icon: '⏱️', color: 'bg-yellow-500' },
    { title: 'Bed Availability', path: '/bed-availability', icon: '🛏️', color: 'bg-green-500' },
    { title: 'Pharmacy Info', path: '/pharmacy-info', icon: '💊', color: 'bg-purple-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Smart e-Hospital</h1>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <HospitalSelector
                hospitals={hospitals}
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
              />
            </div>
            <button
              onClick={() => navigate('/add-patient')}
              className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
            >
              + Add Family Member
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path, { state: { hospitalId: selectedHospital } })}
              className={`${item.color} text-white p-6 rounded-lg shadow-lg hover:opacity-90 transition transform hover:scale-105`}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
