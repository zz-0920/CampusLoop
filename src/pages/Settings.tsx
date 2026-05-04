import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Bell, 
  Eye, 
  HelpCircle, 
  Info, 
  LogOut,
  ChevronRight
} from "lucide-react";

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sections = [
    {
      title: "个人设置",
      items: [
        { icon: <User size={20} />, label: "个人资料", path: "/settings/profile" },
        { icon: <Shield size={20} />, label: "账号与安全", path: "/settings/account" },
      ]
    },
    {
      title: "偏好设置",
      items: [
        { icon: <Bell size={20} />, label: "消息通知", path: "/settings/notifications" },
        { icon: <Eye size={20} />, label: "隐私设置", path: "/settings/privacy" },
      ]
    },
    {
      title: "关于",
      items: [
        { icon: <HelpCircle size={20} />, label: "帮助与反馈", path: "/settings/help" },
        { icon: <Info size={20} />, label: "关于 CampusLoop", path: "/settings/about" },
      ]
    }
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
        <h1 className="text-xl font-bold text-black">设置</h1>
      </div>

      <div className="px-4 py-6 space-y-8">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
              {section.title}
            </h3>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              {section.items.map((item, itemIdx) => (
                <button
                  key={itemIdx}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 active:bg-gray-100 transition-colors group border-b border-gray-50 last:border-0"
                  onClick={() => navigate(item.path)}
                >
                  <div className="text-black opacity-70 group-hover:opacity-100">
                    {item.icon}
                  </div>
                  <span className="flex-1 text-sm text-left text-black font-medium">
                    {item.label}
                  </span>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-600" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={handleLogout}
          className="w-full bg-red-50/50 border border-red-100 p-4 rounded-2xl flex items-center gap-4 text-red-600 hover:bg-red-50 active:bg-red-100 transition-all group mt-4"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <LogOut size={20} />
          </div>
          <span className="flex-1 text-sm text-left font-bold">退出登录</span>
          <ChevronRight size={18} className="text-red-300 group-hover:text-red-600" />
        </button>
      </div>
    </div>
  );
};

export default Settings;
