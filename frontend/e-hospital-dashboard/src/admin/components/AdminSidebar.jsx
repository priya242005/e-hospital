import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminSidebar({ dark, onToggleDark, collapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/hospitals', icon: '🏥', label: 'Hospitals' },
    { path: '/admin/departments', icon: '🏢', label: 'Departments' },
    { path: '/admin/doctors', icon: '👨‍⚕️', label: 'Doctors' },
    { path: '/admin/beds', icon: '🛏️', label: 'Beds' },
    { path: '/admin/opd', icon: '📋', label: 'OPD Queue' },
    { path: '/admin/emergency', icon: '🚨', label: 'Emergency Map' },
  ];

  const bg = dark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800';
  const hdr = dark ? 'bg-gray-800 border-gray-700' : 'bg-[#0b1f3a] text-white';
  const activeClass = dark ? 'bg-blue-700 text-white border-r-4 border-blue-400' : 'bg-blue-50 text-blue-900 border-r-4 border-blue-900';
  const hoverClass = dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const divider = dark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`${bg} ${collapsed ? 'w-16' : 'w-64'} h-screen shadow-xl fixed left-0 top-0 flex flex-col transition-all duration-300 z-40`}>
      {/* Header */}
      <div className={`${hdr} p-4 flex items-center justify-between border-b ${divider}`}>
        {!collapsed && <h2 className="text-lg font-bold tracking-wide">⚕️ Admin Panel</h2>}
        {collapsed && <span className="text-xl mx-auto">⚕️</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            title={collapsed ? item.label : ''}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors text-sm font-medium ${
              location.pathname === item.path ? activeClass : hoverClass
            }`}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className={`border-t ${divider} p-3 flex flex-col gap-2`}>
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          title="Toggle dark/light mode"
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${hoverClass}`}
        >
          <span className="text-lg flex-shrink-0">{dark ? '☀️' : '🌙'}</span>
          {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${hoverClass}`}
        >
          <span className="text-lg flex-shrink-0">{collapsed ? '▶' : '◀'}</span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );
}
