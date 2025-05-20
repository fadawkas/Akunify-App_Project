import React from "react";

function DisabledIconButton({ icon, label }) {
  return (
    <div className="relative group flex justify-center items-center">
      <img
        src={icon}
        alt={label}
        className="h-6 w-6 cursor-not-allowed"
      />
      <span className="absolute left-1/2 bottom-6 mb-2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs px-2 py-1 rounded-md after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:top-full after:border-4 after:border-transparent after:border-t-gray-800">
        {label}
      </span>
    </div>
  );
}

export default DisabledIconButton;
