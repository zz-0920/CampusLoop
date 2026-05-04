import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Users, Plus, MessageCircle } from "lucide-react";
import { getMyClubs } from "../../services/clubService";
import type { Club } from "../../types";

const MyClubs: React.FC = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const data = await getMyClubs();
      setClubs(data as unknown as Club[]);
    } catch (error) {
      console.error("Failed to fetch my clubs", error);
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
          <h1 className="text-xl font-bold text-black">我的社团</h1>
        </div>
        <button 
          onClick={() => navigate("/clubs/create")}
          className="p-2 hover:bg-gray-50 rounded-full transition-colors"
        >
          <Plus size={24} className="text-black" />
        </button>
      </div>

      <div className="px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">加载中...</span>
          </div>
        ) : clubs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {clubs.map((club) => (
              <div
                key={club.id}
                onClick={() => navigate(`/chat/club/${club.id}`)}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100 active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                  {club.logo ? (
                    <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={28} className="text-gray-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-black truncate">{club.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      {club.memberCount} MEMBERS
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-[10px] font-bold text-primary uppercase">OWNER</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-black transition-colors">
                  <MessageCircle size={20} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4 px-10 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200">
              <Users size={40} />
            </div>
            <div>
              <p className="text-base font-bold text-gray-300">暂无社团</p>
              <p className="text-xs mt-1">创建属于你的社团，结交志同道合的朋友</p>
            </div>
            <button 
              onClick={() => navigate("/clubs/create")}
              className="mt-4 px-6 py-2 bg-black text-white rounded-full text-sm font-bold active:scale-95 transition-all"
            >
              立即创建
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClubs;
