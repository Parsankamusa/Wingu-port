import React from "react";

const SectionCard = ({ title, children }) => {
  return(
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
    <h3 className="text-xl font-bold text-secondary-800 mb-6 pb-4 border-b border-gray-100">
      {title}
    </h3>
    {children}
  </div>
)};

export default SectionCard;
