import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  ChevronRight,
  FileText,
  Bookmark,
  Users,
  Award,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { getUserProfile } from "../services/userService";
import type { User } from "../types";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await getUserProfile();
      setUser(data as unknown as User);
    } catch (error) {
      console.error("Failed to load user", error);
      // Fallback to local storage if API fails or token logic
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  if (!user)
    return (
      <div className="flex h-screen items-center justify-center">
        Error loading user
      </div>
    );

  const stats = [
    { label: "帖子", count: user._count?.posts || 0 },
    { label: "粉丝", count: user._count?.followedBy || 0 },
    { label: "关注", count: user._count?.following || 0 },
    { label: "获赞", count: user._count?.interactions || 0 },
  ];

  const menuItems = [
    {
      icon: <FileText size={20} className="text-blue-500" />,
      label: "我的发布",
      count: user._count?.posts || 0,
    },
    {
      icon: <Bookmark size={20} className="text-yellow-500" />,
      label: "我的收藏",
      count: 0,
    },
    {
      icon: <Users size={20} className="text-green-500" />,
      label: "我的社团",
      count: 0,
    },
    {
      icon: <Award size={20} className="text-purple-500" />,
      label: "任务成就",
      count: null,
    },
    {
      icon: <HelpCircle size={20} className="text-gray-400" />,
      label: "客户中心",
      count: null,
    },
  ];

  const medals = [
    { name: "早起达人", icon: "🌅", color: "bg-orange-50" },
    { name: "图书馆馆长", icon: "📚", color: "bg-blue-50" },
    { name: "社牛", icon: "🤝", color: "bg-green-50" },
    { name: "代码之光", icon: "💻", color: "bg-purple-50" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* 1. Header with Gradient */}
      <div className="relative h-48 bg-linear-to-br from-blue-500 to-cyan-400 p-6 flex items-end">
        <button className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full backdrop-blur-sm">
          <Settings size={20} />
        </button>
        <div className="flex items-center gap-4 translate-y-6 bg-white p-4 rounded-2xl shadow-lg w-full">
          <div className="relative">
            <img
              src={
                user.avatar ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              }
              alt={user.name}
              loading="lazy"
              className="w-16 h-16 rounded-full object-cover border-4 border-white"
            />
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[10px] text-white font-bold italic">
                  v
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">{user.name}</h2>
            <p className="text-[10px] text-gray-400">
              {user.school} · {user.department}
            </p>
            <p className="text-[11px] text-gray-600 mt-1 italic">
              {user.bio || "追求卓越，成功就会在不经意间追上你。"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Stats Section */}
      <div className="mt-12 px-4 grid grid-cols-4 gap-2">
        {stats.map((stat, idx) => {
          const isClickable = stat.label === "粉丝" || stat.label === "关注";
          const handleClick = () => {
            if (stat.label === "粉丝") {
              navigate(`/user/${user.id}/followers`);
            } else if (stat.label === "关注") {
              navigate(`/user/${user.id}/following`);
            }
          };
          return (
            <button
              key={idx}
              onClick={isClickable ? handleClick : undefined}
              className={`w-full h-full bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center ${
                isClickable
                  ? "cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  : "cursor-default"
              }`}
            >
              <span className="text-sm font-bold text-gray-800">
                {stat.count}
              </span>
              <span className="text-[10px] text-gray-400 mt-1">
                {stat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Medal Wall */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">勋章墙</h3>
          <button className="text-[10px] text-gray-400">查看更多</button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
          {medals.map((medal, idx) => (
            <div
              key={idx}
              className={`${medal.color} shrink-0 w-20 p-3 rounded-xl flex flex-col items-center gap-1 border border-transparent hover:border-white shadow-sm transition-all`}
            >
              <span className="text-2xl">{medal.icon}</span>
              <span className="text-[10px] text-gray-600 whitespace-nowrap">
                {medal.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Menu List */}
      <section className="px-4 mt-6 space-y-2">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex items-center gap-3 active:bg-gray-50 transition-colors"
          >
            {item.icon}
            <span className="flex-1 text-sm text-left text-gray-700 font-medium">
              {item.label}
            </span>
            {item.count !== null && (
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                {item.count}
              </span>
            )}
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex items-center gap-3 text-red-500 mt-4 active:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="flex-1 text-sm text-left font-medium">退出登录</span>
        </button>
      </section>
    </div>
  );
};

export default Profile;
