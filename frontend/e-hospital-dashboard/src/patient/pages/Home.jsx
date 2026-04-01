import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { title: 'Book OPD Appointment', path: '/opd-booking', desc: 'Schedule a consultation with a doctor', accent: 'border-[#0b1f3a]' },
  { title: 'My Appointments', path: '/my-appointments', desc: 'View and track active appointments', accent: 'border-blue-500' },
  { title: 'Appointment History', path: '/appointment-history', desc: 'Browse your past consultations', accent: 'border-indigo-500' },
  { title: 'Bed Availability', path: '/bed-availability', desc: 'Check real-time bed status across hospitals', accent: 'border-teal-500' },
  { title: 'Hospital Map', path: '/hospital-map', desc: 'View all hospitals on map with bed availability', accent: 'border-red-500' },
  { title: 'Add Family Member', path: '/add-patient', desc: 'Manage family members for booking', accent: 'border-purple-500' },
];

const Home = () => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0b1f3a] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-wide">Smart e-Hospital</h1>
            <p className="text-blue-300 text-sm mt-0.5">Welcome back, {userName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm border border-white/30 text-white px-5 py-2 rounded-lg hover:bg-white/10 transition font-medium"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Patient Portal</h2>
          <p className="text-gray-500 text-sm mt-1">Select a service to get started</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`bg-white text-left p-6 rounded-xl shadow-sm border-l-4 ${item.accent} hover:shadow-md transition-all duration-200 group`}
            >
              <h3 className="text-base font-semibold text-gray-800 group-hover:text-[#0b1f3a] mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
