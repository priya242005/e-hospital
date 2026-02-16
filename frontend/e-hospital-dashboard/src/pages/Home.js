import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const services = [
    { title: 'Book OPD Appointment', path: '/opd', icon: '🏥', desc: 'Get token & doctor assignment' },
    { title: 'Check Waiting Time', path: '/waiting', icon: '⏱️', desc: 'Track your queue status' },
    { title: 'Bed Availability', path: '/beds', icon: '🛏️', desc: 'View hospital bed status' },
    { title: 'Pharmacy Info', path: '/pharmacy', icon: '💊', desc: 'Medicine availability' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to e-Hospital Services</h2>
        <p className="text-gray-600">Access healthcare services digitally. Select a service below to continue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, idx) => (
          <button
            key={idx}
            onClick={() => navigate(service.path)}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-4xl mb-3">{service.icon}</div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">{service.title}</h3>
            <p className="text-sm text-gray-600">{service.desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> All services are available 24/7. For emergencies, please call 102 or visit the nearest hospital directly.
        </p>
      </div>
    </div>
  );
}
