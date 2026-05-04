import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, ShieldCheck, Loader2, ChevronRight } from "lucide-react";
import { changePassword } from "../../services/authService";

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    if (!formData.oldPassword || !formData.newPassword) {
      setMessage({ type: "error", text: "请填写所有必填字段" });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "两次输入的新密码不一致" });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      setMessage({ type: "success", text: "密码修改成功！" });
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => navigate(-1), 1500);
    } catch (error: any) {
      console.error("Failed to change password", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.error || "修改失败，请检查旧密码是否正确" 
      });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-xl font-bold text-black">账号与安全</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-full text-sm font-bold disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "完成"}
        </button>
      </div>

      <div className="px-4 py-8 space-y-8 max-w-md mx-auto">
        {/* Security Status */}
        <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 className="font-bold text-green-800">账号状态安全</h3>
            <p className="text-xs text-green-600 opacity-80">你的账号目前处于安全保护中</p>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">修改密码</h3>
          
          {message && (
            <div className={`p-4 rounded-2xl text-sm ${
              message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 px-1">当前密码</label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.oldPassword}
                  onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                  className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="输入当前密码"
                />
                <Lock size={18} className="absolute left-4 top-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 px-1">新密码</label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="输入新密码"
                />
                <Lock size={18} className="absolute left-4 top-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 px-1">确认新密码</label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="再次输入新密码"
                />
                <Lock size={18} className="absolute left-4 top-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Other Security Options (Placeholder) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">其他选项</h3>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <span className="text-sm text-black font-medium">绑定邮箱</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">未绑定</span>
                <ChevronRight size={18} className="text-gray-300" />
              </div>
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <span className="text-sm text-black font-medium">绑定手机</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">未绑定</span>
                <ChevronRight size={18} className="text-gray-300" />
              </div>
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <span className="text-sm text-red-500 font-medium">注销账号</span>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
