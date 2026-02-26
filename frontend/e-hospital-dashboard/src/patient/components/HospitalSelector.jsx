const HospitalSelector = ({ hospitals, value, onChange, label = "Select Hospital" }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b1f3a] focus:border-transparent bg-white text-gray-700 font-medium transition"
      required
    >
      <option value="">Choose a hospital</option>
      {hospitals.map((hospital) => (
        <option key={hospital.hospital_id} value={hospital.hospital_id}>
          {hospital.hospital_name || hospital.name}
        </option>
      ))}
    </select>
  );
};

export default HospitalSelector;
