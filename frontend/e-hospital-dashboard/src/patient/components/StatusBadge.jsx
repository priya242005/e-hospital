const StatusBadge = ({ status }) => {
  const colors = {
    waiting: 'bg-yellow-100 text-yellow-800',
    consulting: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    available: 'bg-green-100 text-green-800',
    critical: 'bg-red-100 text-red-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    safe: 'bg-green-100 text-green-800',
    emergency: 'bg-red-100 text-red-800',
    elder: 'bg-orange-100 text-orange-800',
    normal: 'bg-green-100 text-green-800'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
