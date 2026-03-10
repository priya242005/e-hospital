const TableCard = ({ title, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-[#0b1f3a] text-white px-6 py-4">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
};

export default TableCard;
