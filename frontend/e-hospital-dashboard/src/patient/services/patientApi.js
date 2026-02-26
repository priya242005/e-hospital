import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const patientApi = {
  getHospitals: (search = '') => 
    axios.get(`${API_BASE_URL}/hospitals`, { 
      params: search ? { search } : {},
      headers: getAuthHeader() 
    }),
  
  assignDoctor: (hospitalId, department) => 
    axios.get(`${API_BASE_URL}/assign/doctor`, {
      params: { hospital_id: hospitalId, department },
      headers: getAuthHeader()
    }),
  
  createOPDQueue: (data) => axios.post(`${API_BASE_URL}/opd`, data, { headers: getAuthHeader() }),
  
  getOPDQueue: (tokenNumber) => 
    axios.get(`${API_BASE_URL}/opd_queue`, {
      params: { token_number: tokenNumber },
      headers: getAuthHeader()
    }),
  
  getBeds: () => axios.get(`${API_BASE_URL}/beds`, { headers: getAuthHeader() }),
  
  getPharmacyQueue: () => axios.get(`${API_BASE_URL}/pharmacy_queue`, { headers: getAuthHeader() }),
  
  getAlerts: () => axios.get(`${API_BASE_URL}/alerts`, { headers: getAuthHeader() }),
  
  getPatients: (userId) => axios.get(`${API_BASE_URL}/patients/by-user/${userId}`, { headers: getAuthHeader() }),
  
  addFamilyMember: (data) => axios.post(`${API_BASE_URL}/patients/family-members`, data, { headers: getAuthHeader() }),
  
  getFamilyMembers: (userId) => axios.get(`${API_BASE_URL}/patients/family-members/${userId}`, { headers: getAuthHeader() }),
  
  getPatientAppointments: (patientId) => 
    axios.get(`${API_BASE_URL}/appointments/by-patient/${patientId}`, { headers: getAuthHeader() }),
  
  getDepartments: (hospitalId) => 
    axios.get(`${API_BASE_URL}/departments`, {
      params: { hospital_id: hospitalId },
      headers: getAuthHeader()
    }),
  
  getDoctors: (hospitalId, departmentId) =>
    axios.get(`${API_BASE_URL}/doctors/by-hospital-department`, {
      params: { hospital_id: hospitalId, department_id: departmentId },
      headers: getAuthHeader()
    }),
  
  createAppointment: (data) => 
    axios.post(`${API_BASE_URL}/appointments`, data, { headers: getAuthHeader() }),
  
  getUserAppointments: (userId) =>
    axios.get(`${API_BASE_URL}/appointments/by-patient/${userId}`, { headers: getAuthHeader() }),
  
  getWaitingTime: (token) =>
    axios.get(`${API_BASE_URL}/opd/waiting-time/${token}`, {
      headers: getAuthHeader()
    })
};

export default patientApi;
