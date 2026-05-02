import React from "react";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isVerified?: boolean;
  shape?: "circle" | "square";
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = "md",
  isVerified = false,
  shape = "circle",
  className = "",
  ...props
}) => {
  const sizeClasses: Record<string, string> = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-24 h-24",
  };

  const roundedClass = shape === "circle" ? "rounded-full" : "rounded-lg";

  return (
    <div 
      className={`relative ${sizeClasses[size] || sizeClasses.md} ${roundedClass} p-[1px] bg-gray-100 ${className}`} 
      {...props}
    >
      <div className={`w-full h-full ${roundedClass} overflow-hidden border border-gray-100 bg-white`}>
        <img
          src={src || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
      {isVerified && (
        <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-black rounded-full border border-white" />
      )}
    </div>
  );
};

export default Avatar;
