const InfoField = ({ icon: Icon, label, value }) => {
  return (
    <div>
      <label className="text-sm text-secondary-500 flex items-center">
        <Icon className="w-4 h-4 mr-2" />
        {label}
      </label>
      <p className="font-semibold mt-1 text-secondary-800">
        {value || "Not set"}
      </p>
    </div>
  );
};

export default InfoField;
