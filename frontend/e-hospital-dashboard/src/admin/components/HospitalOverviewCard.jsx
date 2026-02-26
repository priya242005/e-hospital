export default function HospitalOverviewCard({
  hospitals,
  doctors,
  beds,
  opdData,
  alerts,
}) {
  const AVG_CONSULT_TIME = 10;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {hospitals.map((hospital) => {
        const hospitalDoctors = doctors.filter(
          (d) => d.hospital_id === hospital.hospital_id
        );

        const hospitalBeds = beds.find(
          (b) => b.hospital_id === hospital.hospital_id
        );

        const todayPatients = opdData.filter(
          (o) => o.hospital_id === hospital.hospital_id
        );

        const waitingCount = todayPatients.filter(
          (o) => o.status === "waiting"
        ).length;

        const waitingTime = waitingCount * AVG_CONSULT_TIME;

        const pharmacyAlerts = alerts.filter(
          (a) => a.hospital_id === hospital.hospital_id
        ).length;

        return (
          <div
            key={hospital.hospital_id}
            className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
              <span className="text-xl">🏥</span>
              {hospital.hospital_name || hospital.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">📍 {hospital.city}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Available Beds</span>
                <span className="font-bold text-green-600">{hospitalBeds?.available_beds || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Doctors</span>
                <span className="font-bold text-blue-600">{hospitalDoctors.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Today's OPD</span>
                <span className="font-bold text-purple-600">{todayPatients.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Wait Time</span>
                <span className="font-bold text-orange-600">{waitingTime} mins</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Alerts</span>
                <span className={`font-bold ${pharmacyAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {pharmacyAlerts}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}