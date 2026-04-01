const AlertCard = ({ type = 'info', title, message, icon }) => {
  const typeStyles = {
    info: 'bg-blue-50 border-l-4 border-blue-500 text-blue-800',
    warning: 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800',
    critical: 'bg-red-50 border-l-4 border-red-500 text-red-800',
    success: 'bg-green-50 border-l-4 border-green-500 text-green-800'
  };

  const typeIcons = {
    info: 'ℹ️',
    warning: '⚠️',
    critical: '🚨',
    success: '✅'
  };

  return (
    <div className={`rounded-lg p-4 ${typeStyles[type]}`}>
      <div className="flex gap-3">
        <span className="text-2xl">{icon || typeIcons[type]}</span>
        <div>
          <h4 className="font-bold text-sm">{title}</h4>
          <p className="text-sm mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
