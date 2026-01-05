import React from "react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "underline" | "pill";
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = "",
  variant = "pill",
}) => {
  if (variant === "underline") {
    return (
      <div className={`flex gap-6 border-b border-gray-100 ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`pb-2 text-sm transition-all relative ${
              activeTab === tab.id ? "text-primary font-bold" : "text-gray-400"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    );
  }

  // Pill variant (default)
  return (
    <div
      className={`inline-flex items-center p-1 bg-gray-100/80 rounded-full ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
            activeTab === tab.id
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
