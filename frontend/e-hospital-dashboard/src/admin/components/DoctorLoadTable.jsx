export default function DoctorLoadTable({ doctors, opdData }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">👨‍⚕️</span> Doctor Load Monitoring
      </h2>

      {doctors.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No doctor data available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Doctor</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-700">Current Load</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => {
                const load = opdData.filter(
                  (o) =>
                    o.doctor_id === doc.doctor_id &&
                    o.status === "waiting"
                ).length;

                return (
                  <tr key={doc.doctor_id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{doc.name}</td>
                    <td className="p-4 text-gray-600">{doc.department}</td>
                    <td className="p-4 text-center">
                      <span className="inline-block bg-gray-100 px-3 py-1 rounded-full font-bold text-gray-800">
                        {load}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold text-white ${
                        load > 10 ? "bg-red-500" :
                        load > 5 ? "bg-yellow-500" :
                        "bg-green-500"
                      }`}>
                        {load > 10 ? "Overloaded" : load > 5 ? "Moderate" : "Normal"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}