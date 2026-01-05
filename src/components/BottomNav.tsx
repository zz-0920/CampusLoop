import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Compass, Plus, MessageCircle, User } from "lucide-react";
import { useSocket } from "../context/SocketContext";

const BottomNav: React.FC = () => {
  const { unreadCount } = useSocket();
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-white/90 backdrop-blur-sm border-t border-gray-100 flex justify-around items-center h-16 px-2 z-50">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${
            isActive ? "text-primary font-medium" : "text-gray-400"
          }`
        }
      >
        <Home size={24} />
        <span className="text-[10px]">首页</span>
      </NavLink>
      <NavLink
        to="/discover"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${
            isActive ? "text-primary font-medium" : "text-gray-400"
          }`
        }
      >
        <Compass size={24} />
        <span className="text-[10px]">发现</span>
      </NavLink>
      <NavLink to="/publish" className="flex flex-col items-center -mt-8">
        <div className="bg-primary text-white p-3 rounded-full shadow-lg shadow-blue-200">
          <Plus size={28} />
        </div>
        <span className="text-[10px] mt-1 text-gray-400">发布</span>
      </NavLink>
      <NavLink
        to="/messages"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${
            isActive ? "text-primary font-medium" : "text-gray-400"
          }`
        }
      >
        <div className="relative">
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">消息</span>
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${
            isActive ? "text-primary font-medium" : "text-gray-400"
          }`
        }
      >
        <User size={24} />
        <span className="text-[10px]">我的</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
