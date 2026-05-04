import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../../services/authService";
import { User, Lock, ArrowRight, Sparkles } from "lucide-react";
import type { AuthResponse, ApiError } from "../../types";
import { useSocket } from "../../context/SocketContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { connectSocket, refreshUnreadCount } = useSocket();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "", // For register
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const res = (await login({
          username: formData.username,
          password: formData.password,
        })) as unknown as AuthResponse;
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        
        // Connect socket and fetch unread count immediately after login
        connectSocket();
        refreshUnreadCount();
        
        navigate("/");
      } else {
        await register(formData);
        setIsLogin(true); // Switch to login after success
        setError("注册成功，请登录");
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.error || "操作失败");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {isLogin ? "欢迎回来" : "加入我们需要"}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {isLogin ? "登录你的校园账号" : "开启精彩校园生活"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <User
                className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="用户名"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-700"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            <div className="relative group">
              <Lock
                className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                size={20}
              />
              <input
                type="password"
                placeholder="密码"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-700"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            {!isLogin && (
              <div className="relative group animate-in slide-in-from-top-2 fade-in duration-300">
                <User
                  className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="昵称"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-700"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-linear-to-r from-blue-600 to-cyan-500 text-white py-3.5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLogin ? "登录" : "注册"}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-gray-500 hover:text-blue-600 font-medium text-sm transition-colors"
          >
            {isLogin ? "还没有账号？ 去注册" : "已有账号？ 去登录"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
