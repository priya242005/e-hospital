import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="bg-blue-900 text-white px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => navigate('/')}>
          <h1 className="text-lg md:text-xl font-bold">
            Smart e-Hospital Management System
          </h1>
          <p className="text-xs md:text-sm">
            Government of NCT of Delhi (Prototype)
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
        >
          🏠 Home
        </button>
      </div>
    </div>
  );
}
