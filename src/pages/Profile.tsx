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
import Avatar from "../components/Avatar";

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
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  if (!user)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="glass p-6 rounded-2xl text-white">Error loading user</div>
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
      icon: <FileText size={20} className="text-white" />,
      label: "我的发布",
      count: user._count?.posts || 0,
    },
    {
      icon: <Bookmark size={20} className="text-white" />,
      label: "我的收藏",
      count: 0,
    },
    {
      icon: <Users size={20} className="text-white" />,
      label: "我的社团",
      count: 0,
    },
    {
      icon: <Award size={20} className="text-white" />,
      label: "任务成就",
      count: null,
    },
    {
      icon: <HelpCircle size={20} className="text-white" />,
      label: "客户中心",
      count: null,
    },
  ];

  const medals = [
    { name: "早起达人", icon: "🌅" },
    { name: "图书馆馆长", icon: "📚" },
    { name: "社牛", icon: "🤝" },
    { name: "代码之光", icon: "💻" },
  ];

  return (
    <div className="min-h-screen bg-transparent pb-24 overflow-y-auto no-scrollbar">
      {/* 1. Header Area */}
      <div className="px-4 pt-12 pb-6">
        <div className="flex justify-between items-start mb-8">
          <div className="glass p-4 rounded-2xl flex-1 flex items-center gap-4 mr-3">
            <Avatar 
              src={user.avatar} 
              alt={user.name} 
              size="lg" 
              isVerified={user.isVerified}
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{user.name}</h2>
              <p className="text-xs text-white/70 truncate">
                {user.school} · {user.department}
              </p>
            </div>
          </div>
          <button className="glass p-4 rounded-2xl text-white elastic-press">
            <Settings size={24} />
          </button>
        </div>

        {/* Bio Card */}
        <div className="glass-dark p-4 rounded-2xl mb-8">
          <p className="text-sm text-white/90 italic leading-relaxed">
            "{user.bio || "追求卓越，成功就会在不经意间追上你。"}"
          </p>
        </div>

        {/* 2. Stats Grid - "Glass Bricks" */}
        <div className="grid grid-cols-2 gap-3 mb-8">
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
                className={`bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center elastic-press ${
                  isClickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span className="text-2xl font-bold text-white">
                  {stat.count}
                </span>
                <span className="text-xs text-white/60 mt-1 uppercase tracking-wider font-medium">
                  {stat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Medal Wall */}
      <section className="px-4 mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award size={20} className="text-accent" />
            勋章墙
          </h3>
          <button className="text-xs text-white/60 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">
            查看更多
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
          {medals.map((medal, idx) => (
            <div
              key={idx}
              className="glass shrink-0 w-24 p-4 rounded-2xl flex flex-col items-center gap-3 elastic-press border-white/30"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shadow-inner">
                {medal.icon}
              </div>
              <span className="text-[10px] text-white font-medium text-center leading-tight">
                {medal.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Menu List */}
      <section className="px-4 space-y-3">
        <div className="glass p-2 rounded-3xl space-y-1">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-white/10 active:scale-[0.98] group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className="flex-1 text-sm text-left text-white font-semibold">
                {item.label}
              </span>
              {item.count !== null && (
                <span className="text-[10px] text-white/60 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  {item.count}
                </span>
              )}
              <ChevronRight size={18} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full glass p-5 rounded-3xl flex items-center gap-4 text-white hover:bg-red-500/20 active:scale-[0.98] transition-all group mt-6"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-300">
            <LogOut size={22} />
          </div>
          <span className="flex-1 text-base text-left font-bold tracking-wide">退出登录</span>
          <ChevronRight size={20} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </button>
      </section>
    </div>
  );
};

export default Profile;
