export default function PharmacyAlertPanel({ alerts }) {
  const lowStockAlerts = alerts.filter(a => a.type === "LOW_STOCK" || a.alert_type === "LOW_STOCK");
  const criticalAlerts = alerts.filter(a => a.type === "CRITICAL" || a.alert_type === "CRITICAL");

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">💊</span> Pharmacy Alerts & Demand
      </h2>

      {alerts.length === 0 ? (
        <div className="text-center py-8 bg-green-50 rounded-lg border-2 border-green-200">
          <span className="text-4xl mb-2 block">✅</span>
          <p className="text-green-600 font-semibold">No active alerts</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-3xl font-bold text-red-600">{alerts.length}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-3xl font-bold text-orange-600">{lowStockAlerts.length}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-3xl font-bold text-red-600">{criticalAlerts.length}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-red-50 to-red-100 p-5 rounded-lg shadow-md border-l-4 border-red-500 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="font-bold text-red-800 text-lg">{alert.medicine_name}</p>
                    <p className="text-sm text-red-600 mt-1">{alert.alert_type || alert.type}</p>
                    {alert.hospital_id && (
                      <p className="text-xs text-gray-600 mt-1">Hospital: {alert.hospital_id}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
