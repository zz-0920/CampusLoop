import { Link, useLocation } from "react-router-dom";
import { Home, Compass, PlusSquare, MessageCircle, User } from "lucide-react";
import { useSocket } from "../context/SocketContext";

const BottomNav = () => {
  const location = useLocation();
  const { unreadCount } = useSocket();
  
  const navItems = [
    { icon: Home, label: "首页", path: "/" },
    { icon: Compass, label: "发现", path: "/discover" },
    { icon: PlusSquare, label: "发布", path: "/publish" },
    { icon: MessageCircle, label: "消息", path: "/messages" },
    { icon: User, label: "我", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] glass rounded-full px-6 py-3 shadow-2xl z-50">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const isMessages = item.path === "/messages";

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all duration-300 elastic-press ${
                isActive ? "text-accent -translate-y-1" : "text-gray-500/70"
              }`}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full shadow-[0_0_8px_#00D2FF]" />
                )}
                {isMessages && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
