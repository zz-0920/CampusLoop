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
import { getUserProfile, updateProfile } from "../services/userService";
import type { User } from "../types";
import Avatar from "../components/Avatar";
import { Edit2, Check, X } from "lucide-react";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await getUserProfile() as unknown as User;
      setUser(data);
      setBioText(data.bio || "");
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

  const handleBioSave = async () => {
    if (!user) return;
    setSavingBio(true);
    try {
      await updateProfile({ bio: bioText });
      setUser({ ...user, bio: bioText });
      setIsEditingBio(false);
    } catch (error) {
      console.error("Failed to update bio", error);
      alert("更新签名失败");
    } finally {
      setSavingBio(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
      </div>
    );
  if (!user)
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="p-6 border border-gray-100 rounded-2xl text-black">Error loading user</div>
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
      icon: <FileText size={20} className="text-black" />,
      label: "我的发布",
      count: user._count?.posts || 0,
    },
    {
      icon: <Bookmark size={20} className="text-black" />,
      label: "我的收藏",
      count: 0,
    },
    {
      icon: <Users size={20} className="text-black" />,
      label: "我的社团",
      count: 0,
    },
    {
      icon: <Award size={20} className="text-black" />,
      label: "任务成就",
      count: null,
    },
    {
      icon: <HelpCircle size={20} className="text-black" />,
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
    <div className="min-h-screen bg-white pb-24 overflow-y-auto no-scrollbar">
      {/* 1. Header Area */}
      <div className="px-4 pt-12 pb-6">
        <div className="flex justify-between items-start mb-8">
          <div className="p-4 border border-gray-100 rounded-2xl flex-1 flex items-center gap-4 mr-3 bg-white">
            <Avatar 
              src={user.avatar} 
              alt={user.name} 
              size="lg" 
              isVerified={user.isVerified}
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-black truncate">{user.name}</h2>
              <p className="text-xs text-gray-500 truncate">
                {user.school} · {user.department}
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/settings")}
            className="p-4 border border-gray-100 rounded-2xl text-black bg-white hover:bg-gray-50 active:scale-95 transition-all"
          >
            <Settings size={24} />
          </button>
        </div>

        {/* Bio Card */}
        <div className="group relative">
          {!isEditingBio ? (
            <div 
              onClick={() => setIsEditingBio(true)}
              className="p-4 border border-gray-100 rounded-2xl mb-8 bg-white cursor-pointer hover:border-black/10 transition-colors"
            >
              <p className="text-sm text-gray-700 italic leading-relaxed pr-6">
                {user.bio || "追求卓越，成功就会在不经意间追上你。"}
              </p>
              <Edit2 size={14} className="absolute top-4 right-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            <div className="p-4 border border-black rounded-2xl mb-8 bg-white shadow-sm transition-all">
              <textarea
                autoFocus
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                className="w-full text-sm text-gray-700 italic leading-relaxed bg-transparent border-none focus:ring-0 resize-none p-0"
                rows={2}
                placeholder="介绍一下你自己..."
              />
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  onClick={() => {
                    setIsEditingBio(false);
                    setBioText(user.bio || "");
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X size={16} />
                </button>
                <button 
                  onClick={handleBioSave}
                  disabled={savingBio}
                  className="p-1.5 rounded-full bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {savingBio ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Stats Grid */}
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
                className={`bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center ${
                  isClickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span className="text-2xl font-bold text-black">
                  {stat.count}
                </span>
                <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">
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
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <Award size={20} className="text-black" />
            勋章墙
          </h3>
          <button className="text-xs text-gray-500 border border-gray-100 px-3 py-1.5 rounded-full transition-colors">
            查看更多
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
          {medals.map((medal, idx) => (
            <div
              key={idx}
              className="bg-white shrink-0 w-24 p-4 rounded-2xl flex flex-col items-center gap-3 border border-gray-100"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-2xl shadow-inner">
                {medal.icon}
              </div>
              <span className="text-[10px] text-black font-medium text-center leading-tight">
                {medal.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Menu List */}
      <section className="px-4 space-y-3">
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden divide-y divide-gray-50">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              className="w-full p-4 flex items-center gap-4 transition-all hover:bg-gray-50 active:bg-gray-100 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center transition-transform">
                {item.icon}
              </div>
              <span className="flex-1 text-sm text-left text-black font-semibold">
                {item.label}
              </span>
              {item.count !== null && (
                <span className="text-[10px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                  {item.count}
                </span>
              )}
              <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-white border border-gray-100 p-5 rounded-3xl flex items-center gap-4 text-black hover:bg-red-50 active:bg-red-100 transition-all group mt-6"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
            <LogOut size={22} />
          </div>
          <span className="flex-1 text-base text-left font-bold tracking-wide">退出登录</span>
          <ChevronRight size={20} className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
        </button>
      </section>
    </div>

  );
};

export default Profile;
