const HospitalSelector = ({ hospitals, value, onChange, label = "Select Hospital" }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      >
        <option value="">Choose a hospital</option>
        {hospitals.map((hospital) => (
          <option key={hospital.hospital_id} value={hospital.hospital_id}>
            {hospital.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default HospitalSelector;
