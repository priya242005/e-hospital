import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name || 'User');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { title: 'Book OPD', path: '/opd-booking', icon: '📋', desc: 'Schedule appointment' },
    { title: 'My Appointments', path: '/my-appointments', icon: '📅', desc: 'View bookings' },
    { title: 'Check Waiting Time', path: '/waiting-time', icon: '⏱️', desc: 'Queue status' },
    { title: 'Bed Availability', path: '/bed-availability', icon: '🛏️', desc: 'Check beds' },
    { title: 'Pharmacy Info', path: '/pharmacy-info', icon: '💊', desc: 'Medicine stock' },
    { title: 'Add Family Member', path: '/add-patient', icon: '👨👩👧👦', desc: 'Add family' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0b1f3a] text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Smart e-Hospital</h1>
              <p className="text-blue-200 text-sm mt-1">Welcome, {userName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-[#0b1f3a] px-6 py-2 rounded-lg hover:bg-gray-100 transition font-medium shadow-sm w-full sm:w-auto"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
