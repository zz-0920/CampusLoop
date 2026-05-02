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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="flex items-center justify-around h-16 max-w-[500px] mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const isMessages = item.path === "/messages";

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                isActive ? "text-black" : "text-gray-400"
              }`}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.2 : 1.8} />
                {isMessages && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border border-white">
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
