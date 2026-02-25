import { useEffect, useState } from "react";
import AdminAPI from "../services/adminApi";

import HospitalOverviewCard from "../components/HospitalOverviewCard";
import DoctorLoadTable from "../components/DoctorLoadTable";
import BedStatusPanel from "../components/BedStatusPanel";
import OPDAnalyticsPanel from "../components/OPDAnalyticsPanel";
import PharmacyAlertPanel from "../components/PharmacyAlertPanel";

export default function AdminDashboard() {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [opdData, setOpdData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const hospitalRes = await AdminAPI.get("/hospitals");
      const doctorRes = await AdminAPI.get("/doctors");
      const bedRes = await AdminAPI.get("/beds");
      const opdRes = await AdminAPI.get("/opd");
      const alertRes = await AdminAPI.get("/alerts");

      setHospitals(hospitalRes.data);
      setDoctors(doctorRes.data);
      setBeds(bedRes.data);
      setOpdData(opdRes.data);
      setAlerts(alertRes.data);
    } catch (error) {
      console.error("Admin Dashboard Error:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading dashboard...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                🏥 Hospital Management
              </h1>
              <p className="text-blue-100 text-sm mt-1">Complete Hospital Overview</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Last Updated</p>
              <p className="text-lg font-semibold">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Hospitals</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{hospitals.length}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <span className="text-3xl">🏥</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Doctors</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{doctors.length}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <span className="text-3xl">👨⚕️</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">OPD Patients</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{opdData.length}</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-full">
                <span className="text-3xl">📋</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Alerts</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{alerts.length}</p>
              </div>
              <div className="bg-red-100 p-4 rounded-full">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">🏥</span> Hospital Overview
            </h2>
            {hospitals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No hospital data available</p>
              </div>
            ) : (
              <HospitalOverviewCard
                hospitals={hospitals}
                doctors={doctors}
                beds={beds}
                opdData={opdData}
                alerts={alerts}
              />
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <OPDAnalyticsPanel opdData={opdData} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <DoctorLoadTable doctors={doctors} opdData={opdData} />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <BedStatusPanel beds={beds} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <PharmacyAlertPanel alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
