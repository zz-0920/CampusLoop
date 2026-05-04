import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Heart, Users, Calendar } from "lucide-react";

const NotificationSettings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    likes: true,
    comments: true,
    messages: true,
    mentions: true,
    newEvents: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("notification_settings");
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem("notification_settings", JSON.stringify(newSettings));
  };

  const notificationItems = [
    { key: "likes", label: "点赞提醒", icon: <Heart size={20} className="text-red-500" /> },
    { key: "comments", label: "评论提醒", icon: <MessageSquare size={20} className="text-blue-500" /> },
    { key: "messages", label: "私信提醒", icon: <MessageSquare size={20} className="text-green-500" /> },
    { key: "mentions", label: "@ 我的", icon: <Users size={20} className="text-purple-500" /> },
    { key: "newEvents", label: "活动更新", icon: <Calendar size={20} className="text-orange-500" /> },
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
        <h1 className="text-xl font-bold text-black">消息通知</h1>
      </div>

      <div className="px-4 py-6 space-y-8 max-w-md mx-auto">
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">互动通知</h3>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden divide-y divide-gray-50">
            {notificationItems.map((item) => (
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

        <div className="bg-gray-50 p-4 rounded-2xl">
          <p className="text-xs text-gray-400 leading-relaxed">
            * 开启通知后，当有人给你点赞、评论或发送私信时，你将在第一时间收到消息提醒。
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
