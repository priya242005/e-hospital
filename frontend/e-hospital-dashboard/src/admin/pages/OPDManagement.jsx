import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export default function OPDManagement() {
  const [opdData, setOpdData] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [opdRes, doctorsRes] = await Promise.all([
        axios.get(`${API_BASE}/opd`),
        axios.get(`${API_BASE}/doctors`)
      ]);
      setOpdData(opdRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const waitingPatients = opdData.filter(o => o.status === 'waiting').length;
  const completedPatients = opdData.filter(o => o.status === 'completed').length;
  const emergencyCount = opdData.filter(o => o.priority === 'emergency').length;
  const elderCount = opdData.filter(o => o.priority === 'elder').length;
  const normalCount = opdData.filter(o => o.priority === 'normal').length;

  const doctorLoadData = doctors.map(doctor => {
    const load = opdData.filter(o => o.doctor_id === doctor.doctor_id && o.status === 'waiting').length;
    return { name: doctor.name, load };
  }).sort((a, b) => b.load - a.load).slice(0, 10);

  const maxLoad = Math.max(...doctorLoadData.map(d => d.load), 1);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">OPD Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-900">
          <p className="text-gray-500 text-sm font-medium">Total Patients</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{opdData.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-800">
          <p className="text-gray-500 text-sm font-medium">Waiting</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{waitingPatients}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-700">
          <p className="text-gray-500 text-sm font-medium">Completed</p>
          <p className="text-3xl font-bold text-blue-800 mt-2">{completedPatients}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-500">
          <p className="text-gray-500 text-sm font-medium">Emergency</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">{emergencyCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Doctor Load Distribution</h2>
          <div className="space-y-3">
            {doctorLoadData.map((doctor, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{doctor.name}</span>
                  <span className="text-blue-900 font-bold">{doctor.load} patients</span>
                </div>
                <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-blue-900 h-full transition-all duration-500"
                    style={{ width: `${(doctor.load / maxLoad) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Priority Distribution</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  <span className="font-medium">Emergency</span>
                </div>
                <span className="text-gray-600 font-bold">{emergencyCount}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gray-600 h-full"
                  style={{ width: `${opdData.length > 0 ? (emergencyCount / opdData.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <span className="font-medium">Elder</span>
                </div>
                <span className="text-gray-600 font-bold">{elderCount}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gray-500 h-full"
                  style={{ width: `${opdData.length > 0 ? (elderCount / opdData.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-900 rounded"></div>
                  <span className="font-medium">Normal</span>
                </div>
                <span className="text-blue-900 font-bold">{normalCount}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-900 h-full"
                  style={{ width: `${opdData.length > 0 ? (normalCount / opdData.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Patient Status</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-900 rounded"></div>
                  <span className="font-medium">Waiting</span>
                </div>
                <span className="text-blue-900 font-bold">{waitingPatients}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-900 h-full"
                  style={{ width: `${opdData.length > 0 ? (waitingPatients / opdData.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-700 rounded"></div>
                  <span className="font-medium">Completed</span>
                </div>
                <span className="text-blue-700 font-bold">{completedPatients}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-700 h-full"
                  style={{ width: `${opdData.length > 0 ? (completedPatients / opdData.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Top 5 Busiest Doctors</h2>
          <div className="space-y-3">
            {doctorLoadData.slice(0, 5).map((doctor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-blue-900' : index === 1 ? 'bg-blue-800' : index === 2 ? 'bg-blue-700' : 'bg-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{doctor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 px-3 py-1 rounded-full">
                    <span className="text-blue-900 font-bold">{doctor.load}</span>
                  </div>
                  <span className="text-gray-500 text-sm">patients</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
