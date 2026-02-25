export default function OPDAnalyticsPanel({ opdData }) {
  const emergency = opdData.filter((o) => o.priority === "emergency").length;
  const elder = opdData.filter((o) => o.priority === "elder").length;
  const normal = opdData.filter((o) => o.priority === "normal").length;
  const total = emergency + elder + normal;

  const waiting = opdData.filter((o) => o.status === "waiting").length;
  const completed = opdData.filter((o) => o.status === "completed").length;

  const AVG_CONSULT_TIME = 10;
  const avgWaitTime = waiting > 0 ? waiting * AVG_CONSULT_TIME : 0;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">📊</span> OPD Analytics
      </h2>

      {total === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No OPD data today</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-600">Waiting</p>
              <p className="text-2xl font-bold text-blue-600">{waiting}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completed}</p>
            </div>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 text-center">Avg Wait Time</p>
            <p className="text-2xl font-bold text-orange-600 text-center">{avgWaitTime} mins</p>
          </div>

          <div className="space-y-2">
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-lg border-l-4 border-red-500">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-700">Emergency</span>
                <span className="text-xl font-bold text-red-600">{emergency}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg border-l-4 border-orange-500">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-700">Elder</span>
                <span className="text-xl font-bold text-orange-600">{elder}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border-l-4 border-green-500">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-700">Normal</span>
                <span className="text-xl font-bold text-green-600">{normal}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}