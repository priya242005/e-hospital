import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HospitalMap from '../components/HospitalMap';

const PublicHome = () => {
  const [bedStats, setBedStats] = useState({ general: 0, icu: 0, emergency: 0 });
  const [hospitals, setHospitals] = useState([]);
  const [mapHospitals, setMapHospitals] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [searchHospital, setSearchHospital] = useState('');
  const [announcements] = useState([
    { title: 'COVID-19 Vaccination Drive', desc: 'Free vaccination available at all hospitals', date: '2024-01-15' },
    { title: 'Emergency Services 24/7', desc: 'All hospitals now provide round-the-clock emergency care', date: '2024-01-10' }
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      const [bedsRes, hospitalsRes, mapRes] = await Promise.all([
        axios.get('http://localhost:8000/public/bed-availability'),
        axios.get('http://localhost:8000/hospitals'),
        axios.get('http://localhost:8000/public/hospital-map')
      ]);
      
      const beds = bedsRes.data || [];
      setBedStats({
        general: beds.reduce((sum, h) => sum + (h.general_beds || 0), 0),
        icu: beds.reduce((sum, h) => sum + (h.icu_beds || 0), 0),
        emergency: beds.reduce((sum, h) => sum + (h.emergency_beds || 0), 0)
      });
      setHospitals(hospitalsRes.data || []);
      setMapHospitals(mapRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data');
    }
  };

  const filteredHospitals = hospitals.filter(h => 
    (searchCity === '' || h.city?.toLowerCase().includes(searchCity.toLowerCase())) &&
    (searchHospital === '' || h.hospital_name?.toLowerCase().includes(searchHospital.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Government Header */}
      <header className="bg-[#0b1f3a] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">🏥 Smart e-Hospital System</h1>
              <p className="text-blue-200 text-sm mt-1">Government Digital Health Platform</p>
            </div>
            <nav className="hidden md:flex space-x-6 text-sm">
              <a href="#" className="hover:text-blue-200">Home</a>
              <a href="#hospitals" className="hover:text-blue-200">Hospitals</a>
              <a href="#services" className="hover:text-blue-200">Services</a>
              <a href="#help" className="hover:text-blue-200">Help</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl font-bold text-[#0b1f3a] mb-4">Smart e-Hospital Management System</h2>
          <p className="text-lg text-gray-700 mb-8">Book OPD appointments online, check hospital availability, and access healthcare services easily.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate('/login')} className="bg-[#0b1f3a] text-white px-8 py-3 rounded-lg hover:bg-blue-900 font-semibold">Book OPD Appointment</button>
            <button onClick={() => document.getElementById('hospitals').scrollIntoView({behavior: 'smooth'})} className="bg-white text-[#0b1f3a] border-2 border-[#0b1f3a] px-8 py-3 rounded-lg hover:bg-gray-50 font-semibold">Find Hospitals</button>
            <button onClick={() => document.getElementById('beds').scrollIntoView({behavior: 'smooth'})} className="bg-white text-[#0b1f3a] border-2 border-[#0b1f3a] px-8 py-3 rounded-lg hover:bg-gray-50 font-semibold">Check Bed Availability</button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Healthcare Services */}
        <section id="services">
          <h2 className="text-3xl font-bold text-[#0b1f3a] mb-6 text-center">Healthcare Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border rounded-lg p-6 shadow hover:shadow-lg transition">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">OPD Appointment Booking</h3>
              <p className="text-sm text-gray-600">Book appointments online and get instant token numbers</p>
            </div>
            <div className="bg-white border rounded-lg p-6 shadow hover:shadow-lg transition">
              <div className="text-4xl mb-3">🏥</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Hospital Search</h3>
              <p className="text-sm text-gray-600">Find hospitals by location and department availability</p>
            </div>
            <div className="bg-white border rounded-lg p-6 shadow hover:shadow-lg transition">
              <div className="text-4xl mb-3">🛏️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Bed Availability</h3>
              <p className="text-sm text-gray-600">Real-time bed availability across all hospitals</p>
            </div>
            <div className="bg-white border rounded-lg p-6 shadow hover:shadow-lg transition">
              <div className="text-4xl mb-3">🚨</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Emergency Services</h3>
              <p className="text-sm text-gray-600">24/7 emergency care at all registered hospitals</p>
            </div>
            <div className="bg-white border rounded-lg p-6 shadow hover:shadow-lg transition">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Health Records</h3>
              <p className="text-sm text-gray-600">Access your medical history and appointment records</p>
            </div>
            <div className="bg-white border rounded-lg p-6 shadow hover:shadow-lg transition">
              <div className="text-4xl mb-3">💊</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Medicine Availability</h3>
              <p className="text-sm text-gray-600">Check medicine stock at hospital pharmacies</p>
            </div>
          </div>
        </section>

        {/* Hospital Search */}
        <section id="hospitals" className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-[#0b1f3a] mb-6">Hospital Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input type="text" placeholder="Enter City" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} className="border rounded-lg px-4 py-3" />
            <input type="text" placeholder="Hospital Name" value={searchHospital} onChange={(e) => setSearchHospital(e.target.value)} className="border rounded-lg px-4 py-3" />
            <button onClick={fetchPublicData} className="bg-[#0b1f3a] text-white rounded-lg px-6 py-3 hover:bg-blue-900 font-semibold">Search</button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#0b1f3a] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Hospital Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Beds Available</th>
                </tr>
              </thead>
              <tbody>
                {filteredHospitals.slice(0, 10).map((h, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold">{h.hospital_name}</td>
                    <td className="px-4 py-3 text-sm">{h.city}, {h.state}</td>
                    <td className="px-4 py-3 text-sm">{h.contact_number}</td>
                    <td className="px-4 py-3 text-sm">{h.available_beds}/{h.total_beds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bed Availability Overview */}
        <section id="beds">
          <h2 className="text-3xl font-bold text-[#0b1f3a] mb-6 text-center">Bed Availability Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-l-4 border-green-500 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Available General Beds</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">{bedStats.general}</p>
                </div>
                <div className="text-5xl">🛏️</div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Available</span>
              </div>
            </div>
            <div className="bg-white border-l-4 border-yellow-500 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Available ICU Beds</p>
                  <p className="text-4xl font-bold text-yellow-600 mt-2">{bedStats.icu}</p>
                </div>
                <div className="text-5xl">🏥</div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Limited</span>
              </div>
            </div>
            <div className="bg-white border-l-4 border-red-500 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Available Emergency Beds</p>
                  <p className="text-4xl font-bold text-red-600 mt-2">{bedStats.emergency}</p>
                </div>
                <div className="text-5xl">🚨</div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Emergency</span>
              </div>
            </div>
          </div>
        </section>

        {/* OPD Services Information */}
        <section className="bg-blue-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-[#0b1f3a] mb-6">How to Book OPD Appointment</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6 text-center shadow">
              <div className="text-4xl mb-3">1️⃣</div>
              <h3 className="font-bold text-gray-800 mb-2">Register as Patient</h3>
              <p className="text-sm text-gray-600">Create your account with basic details</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow">
              <div className="text-4xl mb-3">2️⃣</div>
              <h3 className="font-bold text-gray-800 mb-2">Select Hospital & Department</h3>
              <p className="text-sm text-gray-600">Choose hospital and medical department</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow">
              <div className="text-4xl mb-3">3️⃣</div>
              <h3 className="font-bold text-gray-800 mb-2">Get Token Number</h3>
              <p className="text-sm text-gray-600">Receive instant token with waiting time</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow">
              <div className="text-4xl mb-3">4️⃣</div>
              <h3 className="font-bold text-gray-800 mb-2">Visit Hospital</h3>
              <p className="text-sm text-gray-600">Arrive at your scheduled slot</p>
            </div>
          </div>
          <div className="text-center">
            <button onClick={() => navigate('/login')} className="bg-[#0b1f3a] text-white px-10 py-3 rounded-lg hover:bg-blue-900 font-semibold text-lg">Book OPD Now</button>
          </div>
        </section>

        {/* Public Health Announcements */}
        <section id="announcements" className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-[#0b1f3a] mb-6">📢 Public Health Announcements</h2>
          <div className="space-y-4">
            {announcements.map((a, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{a.title}</h3>
                    <p className="text-gray-600 mt-2">{a.desc}</p>
                  </div>
                  <span className="text-sm text-gray-500">{a.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hospital Map */}
        <section id="map">
          <h2 className="text-3xl font-bold text-[#0b1f3a] mb-3">🗺️ Hospital Locations Map</h2>
          <div className="flex gap-6 mb-4 text-sm">
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-green-600 inline-block"></span> Good Availability (&lt;60% full)</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-yellow-600 inline-block"></span> Limited (60–85% full)</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-red-600 inline-block"></span> Critical (&gt;85% full)</span>
          </div>
          <HospitalMap hospitals={mapHospitals} />
        </section>

        {/* Nearby Hospital Finder */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-[#0b1f3a] mb-6">🗺️ Nearby Hospital Finder</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitals.slice(0, 6).map((h, idx) => (
              <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition">
                <h3 className="font-bold text-gray-800">{h.hospital_name}</h3>
                <p className="text-sm text-gray-600 mt-1">{h.address}, {h.city}</p>
                <p className="text-sm text-green-600 mt-2">📞 {h.contact_number}</p>
                <p className="text-sm text-blue-600 mt-1">🛏️ {h.available_beds} beds available</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-3xl font-bold text-[#0b1f3a] mb-6 text-center">Quick Access Portals</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <button onClick={() => navigate('/login')} className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition text-center">
              <div className="text-5xl mb-4">👤</div>
              <h3 className="text-xl font-bold">Patient Portal</h3>
              <p className="text-sm mt-2 opacity-90">Book appointments & track health records</p>
            </button>
            <button onClick={() => navigate('/hospital/login')} className="bg-gradient-to-br from-green-500 to-green-700 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition text-center">
              <div className="text-5xl mb-4">🏥</div>
              <h3 className="text-xl font-bold">Hospital Portal</h3>
              <p className="text-sm mt-2 opacity-90">Manage operations & patient care</p>
            </button>
            <button onClick={() => navigate('/pharmacy/login')} className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition text-center">
              <div className="text-5xl mb-4">💊</div>
              <h3 className="text-xl font-bold">Pharmacy Portal</h3>
              <p className="text-sm mt-2 opacity-90">Manage inventory & prescriptions</p>
            </button>
            <button onClick={() => navigate('/doctor/login')} className="bg-gradient-to-br from-teal-500 to-teal-700 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition text-center">
              <div className="text-5xl mb-4">🩺</div>
              <h3 className="text-xl font-bold">Doctor Portal</h3>
              <p className="text-sm mt-2 opacity-90">View patients & manage consultations</p>
            </button>
            <button onClick={() => navigate('/admin')} className="bg-gradient-to-br from-red-500 to-red-700 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition text-center">
              <div className="text-5xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold">Admin Portal</h3>
              <p className="text-sm mt-2 opacity-90">System monitoring & management</p>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0b1f3a] text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="text-lg font-bold mb-3">Smart e-Hospital System</h3>
              <p className="text-sm text-blue-200">Digital Healthcare Platform</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Contact Support</h3>
              <p className="text-sm text-blue-200">Email: support@ehospital.gov</p>
              <p className="text-sm text-blue-200">Phone: 1800-XXX-XXXX</p>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-6 text-center text-sm text-blue-200">
            © 2024 Smart e-Hospital System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHome;
