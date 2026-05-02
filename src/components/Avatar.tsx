import React from "react";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isVerified?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = "md",
  isVerified = false,
  className = "",
  ...props
}) => {
  const sizeClasses: Record<string, string> = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-24 h-24",
  };

  return (
    <div 
      className={`relative ${sizeClasses[size] || sizeClasses.md} rounded-full p-[2px] bg-gradient-to-tr from-primary via-accent to-secondary ${className}`} 
      {...props}
    >
      <div className="w-full h-full rounded-full overflow-hidden glass border-0">
        <img
          src={src || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
      {isVerified && (
        <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-accent rounded-full border-2 border-white flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-white rounded-full" />
        </div>
      )}
    </div>
  );
};

export default Avatar;
