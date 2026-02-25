const PrioritySelector = ({ value, onChange }) => {
  const priorities = [
    { value: 'emergency', label: 'Emergency', color: 'text-red-600' },
    { value: 'elder', label: 'Elder', color: 'text-orange-600' },
    { value: 'normal', label: 'Normal', color: 'text-green-600' }
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      >
        <option value="">Select Priority</option>
        {priorities.map((priority) => (
          <option key={priority.value} value={priority.value} className={priority.color}>
            {priority.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PrioritySelector;
