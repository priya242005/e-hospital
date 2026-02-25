import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const patientApi = {
  getHospitals: () => axios.get(`${API_BASE_URL}/hospitals`),
  
  assignDoctor: (hospitalId, department) => 
    axios.get(`${API_BASE_URL}/assign/doctor`, {
      params: { hospital_id: hospitalId, department }
    }),
  
  createOPDQueue: (data) => axios.post(`${API_BASE_URL}/opd`, data),
  
  getOPDQueue: (tokenNumber) => 
    axios.get(`${API_BASE_URL}/opd_queue`, {
      params: { token_number: tokenNumber }
    }),
  
  getBeds: () => axios.get(`${API_BASE_URL}/beds`),
  
  getPharmacyQueue: () => axios.get(`${API_BASE_URL}/pharmacy_queue`),
  
  getAlerts: () => axios.get(`${API_BASE_URL}/alerts`),
  
  getPatients: (userId) => axios.get(`${API_BASE_URL}/patients/${userId}`),
  
  createPatient: (data) => axios.post(`${API_BASE_URL}/patients`, data),
  
  getDepartments: (hospitalId) => 
    axios.get(`${API_BASE_URL}/departments`, {
      params: { hospital_id: hospitalId }
    }),
  
  getDoctors: (hospitalId, department) =>
    axios.get(`${API_BASE_URL}/doctors/by-hospital-department`, {
      params: { hospital_id: hospitalId, department: department }
    })
};

export default patientApi;
