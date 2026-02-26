import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export default function HospitalsManagement() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    hospital_name: '',
    address: '',
    city: '',
    latitude: '',
    longitude: '',
    contact_number: ''
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/hospitals`);
      setHospitals(res.data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/hospitals`, {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      });
      alert('Hospital created successfully');
      setShowForm(false);
      setFormData({ hospital_name: '', address: '', city: '', latitude: '', longitude: '', contact_number: '' });
      fetchHospitals();
    } catch (error) {
      alert('Error creating hospital');
    }
  };

  const seedDepartments = async (hospitalId) => {
    try {
      await axios.post(`${API_BASE}/departments/seed?hospital_id=${hospitalId}`);
      alert('Departments seeded successfully');
    } catch (error) {
      alert('Error seeding departments');
    }
  };

  const seedDoctors = async (hospitalId) => {
    try {
      await axios.post(`${API_BASE}/doctors/seed?hospital_id=${hospitalId}`);
      alert('Doctors seeded successfully');
    } catch (error) {
      alert(error.response?.data?.detail || 'Error seeding doctors');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hospitals Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add Hospital'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Create New Hospital</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Hospital Name"
              value={formData.hospital_name}
              onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Contact Number"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="border p-2 rounded col-span-2"
              required
            />
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <button type="submit" className="col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Create Hospital
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {hospitals.map((hospital) => (
            <div key={hospital.hospital_id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{hospital.hospital_name}</h3>
                  <p className="text-gray-600">{hospital.address}, {hospital.city}</p>
                  <p className="text-sm text-gray-500">Contact: {hospital.contact_number}</p>
                  <p className="text-sm text-gray-500">Location: {hospital.latitude}, {hospital.longitude}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => seedDepartments(hospital.hospital_id)}
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                  >
                    Seed Departments
                  </button>
                  <button
                    onClick={() => seedDoctors(hospital.hospital_id)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                  >
                    Seed Doctors
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
