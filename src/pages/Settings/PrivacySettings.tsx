import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Lock, Unlock, ChevronRight } from "lucide-react";

const PrivacySettings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    profilePublic: true,
    showOnlineStatus: true,
    allowStrangersMsg: false,
    showCollections: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("privacy_settings");
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem("privacy_settings", JSON.stringify(newSettings));
  };

  const privacyItems = [
    { key: "profilePublic", label: "公开个人主页", icon: <Eye size={20} className="text-gray-600" /> },
    { key: "showOnlineStatus", label: "显示在线状态", icon: <Unlock size={20} className="text-gray-600" /> },
    { key: "allowStrangersMsg", label: "允许陌生人私信", icon: <Lock size={20} className="text-gray-600" /> },
    { key: "showCollections", label: "展示我的收藏", icon: <Eye size={20} className="text-gray-600" /> },
  ];

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-gray-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-black" />
        </button>
        <h1 className="text-xl font-bold text-black">隐私设置</h1>
      </div>

      <div className="px-4 py-6 space-y-8 max-w-md mx-auto">
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">隐私权限</h3>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden divide-y divide-gray-50">
            {privacyItems.map((item) => (
              <div key={item.key} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-sm text-black font-medium">{item.label}</span>
                </div>
                <button
                  onClick={() => toggleSetting(item.key as keyof typeof settings)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings[item.key as keyof typeof settings] ? "bg-black" : "bg-gray-200"
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    settings[item.key as keyof typeof settings] ? "left-7" : "left-1"
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">其他</h3>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden divide-y divide-gray-50">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <span className="text-sm text-black font-medium">黑名单管理</span>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
