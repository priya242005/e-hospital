export default function BedStatusPanel({ beds }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">🛏</span> Bed Availability
      </h2>

      {beds.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No bed data available</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {beds.map((bed) => (
            <div
              key={bed.hospital_id}
              className={`p-5 rounded-lg shadow-md transition-all duration-300 hover:scale-105 border-2 ${
                bed.status === "green"
                  ? "bg-gradient-to-br from-green-50 to-green-100 border-green-300"
                  : bed.status === "yellow"
                  ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300"
                  : "bg-gradient-to-br from-red-50 to-red-100 border-red-300"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <p className="font-bold text-gray-800">{bed.hospital_id}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  bed.status === "green" ? "bg-green-500 text-white" :
                  bed.status === "yellow" ? "bg-yellow-500 text-white" :
                  "bg-red-500 text-white"
                }`}>
                  {bed.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold">{bed.total_beds}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available</span>
                  <span className="font-bold text-green-600">{bed.available_beds}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}