import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export default function DoctorsManagement() {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    hospital_id: '',
    department_id: '',
    name: '',
    specialization: '',
    max_daily_opd: ''
  });

  useEffect(() => {
    fetchHospitals();
    fetchDoctors();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/hospitals`);
      setHospitals(res.data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchDepartments = async (hospitalId) => {
    try {
      const res = await axios.get(`${API_BASE}/departments?hospital_id=${hospitalId}`);
      setDepartments(res.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_BASE}/doctors`);
      setDoctors(res.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleHospitalChange = (hospitalId) => {
    setFormData({ ...formData, hospital_id: hospitalId, department_id: '' });
    fetchDepartments(hospitalId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/doctors`, {
        ...formData,
        max_daily_opd: formData.max_daily_opd ? parseInt(formData.max_daily_opd) : null
      });
      alert('Doctor created successfully');
      setShowForm(false);
      setFormData({ hospital_id: '', department_id: '', name: '', specialization: '', max_daily_opd: '' });
      fetchDoctors();
    } catch (error) {
      alert('Error creating doctor');
    }
  };

  const deleteDoctor = async (doctorId) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await axios.delete(`${API_BASE}/doctors/${doctorId}`);
      alert('Doctor deleted');
      fetchDoctors();
    } catch (error) {
      alert('Error deleting doctor');
    }
  };

  const toggleAvailability = async (doctorId, currentStatus) => {
    try {
      await axios.put(`${API_BASE}/doctors/${doctorId}`, null, {
        params: { availability: currentStatus === 'available' ? 'unavailable' : 'available' }
      });
      fetchDoctors();
    } catch (error) {
      alert('Error updating availability');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Doctors Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add Doctor'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Create New Doctor</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={formData.hospital_id}
              onChange={(e) => handleHospitalChange(e.target.value)}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Select Hospital</option>
              {hospitals.map((h) => (
                <option key={h.hospital_id} value={h.hospital_id}>
                  {h.hospital_name}
                </option>
              ))}
            </select>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              className="border p-2 rounded w-full"
              required
              disabled={!formData.hospital_id}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.department_name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Doctor Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="text"
              placeholder="Specialization"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="number"
              placeholder="Max Daily OPD (optional)"
              value={formData.max_daily_opd}
              onChange={(e) => setFormData({ ...formData, max_daily_opd: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              Create Doctor
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {doctors.map((doctor) => (
          <div key={doctor.doctor_id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">{doctor.name}</h3>
              <p className="text-sm text-gray-600">{doctor.specialization}</p>
              <p className="text-xs text-gray-500">Hospital ID: {doctor.hospital_id}</p>
              <p className="text-xs text-gray-500">Department ID: {doctor.department_id}</p>
              {doctor.max_daily_opd && <p className="text-xs text-gray-500">Max OPD: {doctor.max_daily_opd}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleAvailability(doctor.doctor_id, doctor.availability)}
                className={`px-3 py-1 rounded text-sm ${doctor.availability === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {doctor.availability}
              </button>
              <button
                onClick={() => deleteDoctor(doctor.doctor_id)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
