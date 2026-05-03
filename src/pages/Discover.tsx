import React, { useState, useEffect } from "react";
import { Send, ChevronRight, Plus, MessageCircle, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDiscoverUsers, getClubs } from "../services/discoverService";
import { getEvents } from "../services/eventService";
import type { User, Club, Event } from "../types";

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, clubsData, eventsData] = await Promise.all([
        getDiscoverUsers(),
        getClubs(),
        getEvents(),
      ]);
      setCandidates(usersData as unknown as User[]);
      setClubs(clubsData as unknown as Club[]);
      setEvents(eventsData as unknown as Event[]);
    } catch (error) {
      console.error("Failed to load discover data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400 bg-white">
        加载中...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col text-black">
      {/* Sticky Header */}
      <header className="px-6 py-5 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-50">
        <h1 className="text-xl font-bold">发现</h1>
        <button 
          onClick={() => navigate("/clubs/create")}
          className="p-2 hover:bg-gray-50 rounded-full transition-colors"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col gap-10 pb-24 px-6 pt-6 no-scrollbar">
        {/* 1. Discover Friends (Matching Card) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">发现伙伴</h2>
            <button className="text-black text-xs font-bold flex items-center gap-1">
              换一批 <ChevronRight size={14} />
            </button>
          </div>
          {candidates.length > 0 ? (
            <div className="relative aspect-[4/5] w-full rounded-none overflow-hidden border border-gray-100 group">
              <img
                src={
                  candidates[0].avatar ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                }
                alt={candidates[0].name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold">{candidates[0].name}</span>
                  <span className="text-[10px] font-bold uppercase border border-white/40 px-2 py-0.5 rounded-sm">
                    {candidates[0].school || "未知学校"}
                  </span>
                </div>
                <p className="text-sm text-white/80 line-clamp-2">
                  {candidates[0].bio || "这个家伙很懒，什么都没有留下"}
                </p>
              </div>
            </div>
          ) : (
            <div className="aspect-[4/5] w-full bg-gray-50 flex items-center justify-center text-gray-300">
              暂无推荐用户
            </div>
          )}
        </section>

        {/* 2. Communication */}
        <section className="flex flex-col gap-4">
          {/* Campus Paper Plane */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-black flex items-center justify-between shadow-sm">
            <div>
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <Send size={20} /> 校园纸飞机
              </h3>
              <p className="text-xs text-gray-500">
                匿名分享你的心情
              </p>
            </div>
            <button 
              onClick={() => navigate("/toolbox/paper-plane")}
              className="bg-black text-white px-5 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform"
            >
              去投递
            </button>
          </div>

          {/* Public Square */}
          <div 
            onClick={() => navigate("/chat/public")}
            className="bg-white border border-gray-100 rounded-2xl p-6 text-black flex items-center justify-between shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div>
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <MessageSquare size={20} /> 公共广场
              </h3>
              <p className="text-xs text-gray-500">
                全校共享聊天室
              </p>
            </div>
            <button className="bg-black text-white px-5 py-2 rounded-full text-xs font-bold">
              进入
            </button>
          </div>
        </section>

        {/* 3. Clubs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">热门社团</h2>
            <button className="text-black text-xs font-bold">查看全部</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {clubs.length > 0 ? (
              clubs.map((club) => (
                <div
                  key={club.id}
                  onClick={() => navigate(`/chat/club/${club.id}`)}
                  className="shrink-0 w-36 flex flex-col cursor-pointer group"
                >
                  <div className="aspect-square bg-gray-50 border border-gray-100 flex items-center justify-center mb-3 overflow-hidden">
                    {club.logo ? (
                      <img src={club.logo} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-200">{club.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-sm font-bold text-black truncate flex-1">
                      {club.name}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/chat/club/${club.id}`);
                      }}
                      className="text-gray-400 hover:text-black p-1 -mt-1 -mr-1 shrink-0 transition-colors"
                    >
                      <MessageCircle size={14} />
                    </button>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {club.memberCount} MEMBERS
                  </span>
                </div>
              ))
            ) : (
              <div className="py-4 text-gray-300 text-sm italic">暂无社团</div>
            )}
          </div>
        </section>

        {/* 4. Activity Preview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">活动预告</h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/events/create")}
                className="text-black text-xs font-bold flex items-center gap-1"
              >
                <Plus size={14} /> 发起活动
              </button>
              <button className="text-black text-xs font-bold">更多</button>
            </div>
          </div>
          <div className="space-y-8">
            {events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-4 border-b border-gray-50 pb-8 last:border-0"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-50 border border-gray-100">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200 font-bold text-xl bg-gray-50">
                        {event.title.charAt(0)}
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      {event.date}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-black mb-1">
                      {event.title}
                    </h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">
                      @ {event.location}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center bg-gray-50 text-gray-400 text-sm italic">
                暂无活动预告
              </div>
            )}
          </div>
        </section>

        {/* 5. Toolbox Grid */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">校园工具箱</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: "失物招领", icon: "🔍", type: "lost_found" },
              { name: "二手交易", icon: "🛒", type: "trade" },
              { name: "表白墙", icon: "💌", type: "confession" },
            ].map((tool) => (
              <button
                key={tool.name}
                onClick={() => navigate(`/posts/category/${tool.type}`)}
                className="flex flex-col items-center gap-3 active:scale-95 transition-transform"
              >
                <div className="w-full aspect-square bg-gray-50 border border-gray-50 flex items-center justify-center text-xl">
                  {tool.icon}
                </div>
                <span className="text-[10px] text-black font-bold uppercase tracking-tighter">
                  {tool.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Discover;
