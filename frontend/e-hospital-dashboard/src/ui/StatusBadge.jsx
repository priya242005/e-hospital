const StatusBadge = ({ status }) => {
  const statusConfig = {
    green: { bg: "bg-green-100", text: "text-green-700", label: "Normal" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Busy" },
    red: { bg: "bg-red-100", text: "text-red-700", label: "Overloaded" },
    available: { bg: "bg-green-100", text: "text-green-700", label: "Available" },
    occupied: { bg: "bg-red-100", text: "text-red-700", label: "Occupied" },
    reserved: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Reserved" }
  };

  const config = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-700", label: status };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
