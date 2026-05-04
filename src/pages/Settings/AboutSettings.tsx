import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Shield, Heart, ChevronRight, Terminal } from "lucide-react";

const AboutSettings: React.FC = () => {
  const navigate = useNavigate();

  const version = "1.0.4";

  const items = [
    { label: "版本更新", value: `v${version}`, path: "/about/update" },
    { label: "服务协议", value: "", path: "/about/terms" },
    { label: "隐私政策", value: "", path: "/about/privacy" },
    { label: "开源许可", value: "", path: "/about/licenses" },
  ];

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-gray-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-black" />
        </button>
        <h1 className="text-xl font-bold text-black">关于 CampusLoop</h1>
      </div>

      <div className="px-4 py-12 flex flex-col items-center gap-6 max-w-md mx-auto">
        {/* App Logo/Icon Mockup */}
        <div className="w-24 h-24 bg-black rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-black/20">
          <Terminal size={48} />
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-black text-black tracking-tight">CampusLoop</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">连接校园，触手可及</p>
        </div>

        <div className="w-full mt-8 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden divide-y divide-gray-50">
            {items.map((item, idx) => (
              <button
                key={idx}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group"
              >
                <span className="text-sm text-black font-semibold">{item.label}</span>
                <div className="flex items-center gap-3">
                  {item.value && <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded-lg">{item.value}</span>}
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-black transition-colors" />
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 pt-12">
            <div className="flex items-center gap-6 text-gray-300">
              <Globe size={20} className="hover:text-black cursor-pointer transition-colors" />
              <Shield size={20} className="hover:text-black cursor-pointer transition-colors" />
              <Heart size={20} className="hover:text-black cursor-pointer transition-colors" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                Copyright © 2026 CampusLoop Team.
              </p>
              <p className="text-[10px] text-gray-200 uppercase tracking-widest">
                Built with passion in University.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSettings;
