import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children, sidebarItems, title, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(sidebarItems[0]?.id || 'dashboard');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0b1f3a] text-white transition-all duration-300 fixed h-screen overflow-y-auto`}>
        <div className="p-4 border-b border-blue-800">
          <h2 className={`font-bold ${sidebarOpen ? 'text-lg' : 'text-xs text-center'}`}>
            {sidebarOpen ? '🏥 e-Hospital' : '🏥'}
          </h2>
        </div>
        
        <nav className="py-4">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full px-4 py-3 text-left hover:bg-blue-900 transition flex items-center gap-3 ${
                activeTab === item.id ? 'bg-blue-900 border-l-4 border-white' : ''
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full p-4 border-t border-blue-800 hover:bg-blue-900 text-center"
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 flex flex-col transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-[#0b1f3a]">{title}</h1>
            <p className="text-sm text-gray-600">{user?.name || 'User'}</p>
          </div>
          <div className="flex gap-4 items-center">
            <button className="text-gray-600 hover:text-gray-900 text-2xl">🔔</button>
            <button
              onClick={handleLogout}
              className="bg-[#0b1f3a] text-white px-6 py-2 rounded-lg hover:bg-blue-900 font-semibold"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children(activeTab, setActiveTab)}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
