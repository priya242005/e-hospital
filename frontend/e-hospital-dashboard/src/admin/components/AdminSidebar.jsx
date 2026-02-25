import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/hospitals', icon: '🏥', label: 'Hospitals' },
    { path: '/admin/doctors', icon: '👨‍⚕️', label: 'Doctors' },
    { path: '/admin/beds', icon: '🛏️', label: 'Beds' },
    { path: '/admin/opd', icon: '📋', label: 'OPD Queue' },
    { path: '/admin/pharmacy', icon: '💊', label: 'Pharmacy' },
    { path: '/admin/emergency', icon: '🚨', label: 'Emergency Map' },
  ];

  return (
    <div className="w-64 bg-white h-screen shadow-lg fixed left-0 top-0">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      
      <nav className="mt-4">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
