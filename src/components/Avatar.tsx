import React from "react";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isVerified?: boolean;
  isOnline?: boolean;
  className?: string;
  shape?: "circle" | "square";
}

const Avatar: React.FC<AvatarProps> = ({
  src = "",
  alt = "",
  size = "md",
  isVerified = false,
  isOnline = false,
  className = "",
  shape = "circle",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  const roundedClass = shape === "square" ? "rounded-xl" : "rounded-full";

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`w-full h-full ${roundedClass} object-cover border border-gray-100`}
      />
      {isVerified && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center p-0.5">
          <span className="text-[6px] text-white font-bold italic">v</span>
        </div>
      )}
      {isOnline && (
        <div className="absolute -top-0.5 -right-0.5 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

export default Avatar;
