import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { getUserProfile, updateProfile } from "../../services/userService";
import type { User } from "../../types";
import Avatar from "../../components/Avatar";

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    school: "",
    department: "",
    avatar: "",
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await getUserProfile() as unknown as User;
      setFormData({
        name: data.name || "",
        bio: data.bio || "",
        school: data.school || "",
        department: data.department || "",
        avatar: data.avatar || "",
      });
    } catch (error) {
      console.error("Failed to load user", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      // Update local storage if needed
      const stored = localStorage.getItem("user");
      if (stored) {
        const updated = { ...JSON.parse(stored), ...formData };
        localStorage.setItem("user", JSON.stringify(updated));
      }
      navigate(-1);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-black" />
          </button>
          <h1 className="text-xl font-bold text-black">个人资料</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-black text-white rounded-full text-sm font-bold disabled:opacity-50 transition-all active:scale-95"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>

      <div className="px-4 py-8 space-y-8 max-w-md mx-auto">
        {/* Avatar Edit */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <Avatar 
              src={formData.avatar} 
              alt={formData.name} 
              size="xl" 
            />
            <button className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </button>
          </div>
          <span className="text-xs text-gray-400">点击更换头像</span>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">昵称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black transition-colors"
              placeholder="输入你的昵称"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">简介</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black transition-colors min-h-[100px] resize-none"
              placeholder="介绍一下你自己..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">学校</label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="你的学校"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">学院</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="你的学院"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
