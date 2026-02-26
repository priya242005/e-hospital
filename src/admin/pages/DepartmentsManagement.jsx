import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export default function DepartmentsManagement() {
  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    hospital_id: '',
    department_name: '',
    description: ''
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (selectedHospital) {
      fetchDepartments(selectedHospital);
    }
  }, [selectedHospital]);

  const fetchHospitals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/hospitals`);
      setHospitals(res.data);
      if (res.data.length > 0) {
        setSelectedHospital(res.data[0].hospital_id);
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/departments`, formData);
      alert('Department created successfully');
      setShowForm(false);
      setFormData({ hospital_id: '', department_name: '', description: '' });
      fetchDepartments(selectedHospital);
    } catch (error) {
      alert('Error creating department');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Departments Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add Department'}
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Hospital</label>
        <select
          value={selectedHospital}
          onChange={(e) => setSelectedHospital(e.target.value)}
          className="border p-2 rounded w-full max-w-md"
        >
          {hospitals.map((h) => (
            <option key={h.hospital_id} value={h.hospital_id}>
              {h.hospital_name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Create New Department</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={formData.hospital_id}
              onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
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
            <input
              type="text"
              placeholder="Department Name"
              value={formData.department_name}
              onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              Create Department
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.department_id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold">{dept.department_name}</h3>
            <p className="text-sm text-gray-600">{dept.description || 'No description'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
