import React, { useState, useEffect } from "react";
import { Send, Users, Calendar, Grid, ChevronRight } from "lucide-react";
import { mockEvents } from "../data/mockData";
import { getDiscoverUsers, getClubs } from "../services/discoverService";
import type { User, Club } from "../types";

const Discover: React.FC = () => {
  const [candidates, setCandidates] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, clubsData] = await Promise.all([
        getDiscoverUsers(),
        getClubs(),
      ]);
      setCandidates(usersData as unknown as User[]);
      setClubs(clubsData as unknown as Club[]);
    } catch (error) {
      console.error("Failed to load discover data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto flex flex-col gap-6 pb-20">
      {/* 1. Discover Friends (Matching Card) */}
      <section className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">发现契合伙伴</h2>
          <button className="text-primary text-xs flex items-center">
            换一批 <ChevronRight size={14} />
          </button>
        </div>
        {candidates.length > 0 ? (
          <div className="relative h-[300px] w-full rounded-2xl overflow-hidden shadow-xl border border-white">
            <img
              src={
                candidates[0].avatar ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=Coco"
              }
              alt={candidates[0].name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold">{candidates[0].name}</span>
                <span className="text-xs bg-primary/80 px-2 py-0.5 rounded-full">
                  {candidates[0].school || "未知学校"}
                </span>
              </div>
              <p className="text-xs text-gray-200 line-clamp-1 mb-2">
                {candidates[0].bio || "这个家伙很懒，什么都没有留下"}
              </p>
              <div className="flex gap-2">
                {/* Mock interests for now as DB doesn't have them yet */}
                {["摄影", "代码", "旅行"].map((interest) => (
                  <span
                    key={interest}
                    className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-1 rounded-md"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[300px] w-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
            暂无推荐用户
          </div>
        )}
      </section>

      {/* 2. Campus Paper Plane */}
      <section className="px-4">
        <div className="bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg shadow-blue-100">
          <div>
            <h3 className="font-bold mb-1 flex items-center gap-2">
              <Send size={18} /> 校园纸飞机
            </h3>
            <p className="text-[11px] opacity-90">
              匿名分享你的心情，投递给远方的 Ta
            </p>
          </div>
          <button className="bg-white text-primary px-4 py-2 rounded-full text-xs font-bold shadow-md">
            去投递
          </button>
        </div>
      </section>

      {/* 3. Clubs */}
      <section>
        <div className="px-4 flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users size={20} className="text-primary" /> 热门社团
          </h2>
          <button className="text-gray-400 text-xs">查看全部</button>
        </div>
        <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar pb-2">
          {clubs.length > 0 ? (
            clubs.map((club) => (
              <div
                key={club.id}
                className="shrink-0 w-32 bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center"
              >
                <img
                  src={club.logo}
                  alt={club.name}
                  loading="lazy"
                  className="w-12 h-12 rounded-full mb-2 object-cover border-2 border-primary/10"
                />
                <span className="text-xs font-bold text-gray-800 mb-1">
                  {club.name}
                </span>
                <span className="text-[10px] text-gray-400">
                  {club.memberCount} 成员
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 text-gray-400 text-sm">暂无社团</div>
          )}
        </div>
      </section>

      {/* 4. Activity Preview */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Calendar size={20} className="text-primary" /> 活动预告
          </h2>
          <button className="text-gray-400 text-xs">更多</button>
        </div>
        <div className="space-y-4">
          {mockEvents.map((event) => (
            <div
              key={event.id}
              className="flex gap-3 bg-white p-3 rounded-2xl border border-gray-50 shadow-sm"
            >
              <img
                src={event.image}
                alt={event.title}
                loading="lazy"
                className="w-24 h-24 rounded-xl object-cover"
              />
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">
                    {event.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Calendar size={12} /> {event.date}
                  </p>
                </div>
                <p className="text-[10px] text-primary bg-primary/5 self-start px-2 py-1 rounded-md font-medium">
                  地点: {event.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Toolbox Grid */}
      <section className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Grid size={20} className="text-primary" /> 校园工具箱
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { name: "失物招领", icon: "🔍" },
            { name: "二手交易", icon: "🛒" },
            { name: "表白墙", icon: "💌" },
            { name: "课程表", icon: "📅" },
          ].map((tool) => (
            <button
              key={tool.name}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                {tool.icon}
              </div>
              <span className="text-[10px] text-gray-600 font-medium">
                {tool.name}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Discover;
