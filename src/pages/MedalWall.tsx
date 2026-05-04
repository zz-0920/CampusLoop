import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Check, X } from "lucide-react";
import {
  getAllBadges,
  toggleBadgeDisplay,
  type BadgeInfo,
} from "../services/badgeService";

type FilterTab = "all" | "unlocked" | "locked";

const MedalWall: React.FC = () => {
  const navigate = useNavigate();
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedBadge, setSelectedBadge] = useState<BadgeInfo | null>(null);
  const [toggling, setToggling] = useState(false);

  const loadBadges = useCallback(async () => {
    try {
      const data = await getAllBadges();
      setBadges(data);
    } catch (error) {
      console.error("Failed to load badges", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  const filteredBadges = badges.filter((b) => {
    if (activeTab === "unlocked") return b.isUnlocked;
    if (activeTab === "locked") return !b.isUnlocked;
    return true;
  });

  const handleToggleDisplay = async (badge: BadgeInfo) => {
    if (!badge.isUnlocked || toggling) return;
    setToggling(true);
    try {
      const res = await toggleBadgeDisplay(badge.id);
      setBadges((prev) =>
        prev.map((b) =>
          b.id === badge.id ? { ...b, isDisplayed: res.isDisplayed } : b
        )
      );
      if (selectedBadge?.id === badge.id) {
        setSelectedBadge({ ...badge, isDisplayed: res.isDisplayed });
      }
    } catch (error) {
      console.error("Failed to toggle display", error);
    } finally {
      setToggling(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "全部" },
    { key: "unlocked", label: "已解锁" },
    { key: "locked", label: "未解锁" },
  ];

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={22} className="text-black" />
          </button>
          <h1 className="text-lg font-bold text-black">勋章墙</h1>
          <div className="w-10" />
        </div>

        {/* Stats bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
              <span className="text-amber-600 text-xs font-semibold">
                🏅 已解锁 {unlockedCount}/{badges.length}
              </span>
            </div>
          </div>
        </div>

        {/* Tab filter */}
        <div className="flex px-4 pb-3 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-black text-white shadow-md"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badge grid */}
      <div className="p-4">
        {filteredBadges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="text-4xl mb-3">🎖️</div>
            <p className="text-sm">
              {activeTab === "unlocked"
                ? "暂无已解锁的勋章"
                : activeTab === "locked"
                ? "所有勋章都已解锁！"
                : "暂无勋章"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredBadges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`relative p-4 rounded-2xl flex flex-col items-center gap-2.5 transition-all duration-200 active:scale-95 ${
                  badge.isUnlocked
                    ? "bg-gradient-to-b from-amber-50/80 to-white border-2 border-amber-200/60 shadow-sm hover:shadow-md hover:border-amber-300"
                    : "bg-gray-50/80 border-2 border-dashed border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Display indicator */}
                {badge.isUnlocked && badge.isDisplayed && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Icon container */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${
                    badge.isUnlocked
                      ? "bg-gradient-to-br from-amber-100 to-amber-50 shadow-inner"
                      : "bg-gray-100"
                  }`}
                  style={
                    badge.isUnlocked
                      ? {}
                      : { filter: "grayscale(100%)", opacity: 0.4 }
                  }
                >
                  {badge.icon}
                </div>

                {/* Lock overlay for locked badges */}
                {!badge.isUnlocked && (
                  <div className="absolute top-3 right-3">
                    <Lock size={12} className="text-gray-300" />
                  </div>
                )}

                {/* Name */}
                <span
                  className={`text-[11px] font-medium text-center leading-tight ${
                    badge.isUnlocked ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {badge.name}
                </span>

                {/* Progress for locked badges */}
                {!badge.isUnlocked && (
                  <div className="w-full">
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (badge.currentProgress / badge.conditionValue) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1 text-center">
                      {badge.currentProgress}/{badge.conditionValue}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setSelectedBadge(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

          {/* Bottom Sheet */}
          <div
            className="relative w-full max-w-md bg-white rounded-t-3xl p-6 pb-8 animate-[slideUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} className="text-gray-400" />
            </button>

            {/* Badge icon */}
            <div className="flex justify-center mb-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
                  selectedBadge.isUnlocked
                    ? "bg-gradient-to-br from-amber-100 to-amber-50 shadow-lg shadow-amber-200/50"
                    : "bg-gray-100"
                }`}
                style={
                  selectedBadge.isUnlocked
                    ? {}
                    : { filter: "grayscale(100%)", opacity: 0.5 }
                }
              >
                {selectedBadge.icon}
              </div>
            </div>

            {/* Badge name */}
            <h3 className="text-xl font-bold text-center text-black mb-2">
              {selectedBadge.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 text-center mb-5">
              {selectedBadge.description}
            </p>

            {selectedBadge.isUnlocked ? (
              <>
                {/* Unlock time */}
                <div className="flex items-center justify-center gap-2 mb-5">
                  <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="text-xs text-amber-700 font-medium">
                      🎉 解锁于 {formatDate(selectedBadge.unlockedAt)}
                    </span>
                  </div>
                </div>

                {/* Display toggle */}
                <button
                  onClick={() => handleToggleDisplay(selectedBadge)}
                  disabled={toggling}
                  className={`w-full py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    selectedBadge.isDisplayed
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${toggling ? "opacity-50" : ""}`}
                >
                  {toggling
                    ? "处理中..."
                    : selectedBadge.isDisplayed
                    ? "✓ 已展示在个人主页"
                    : "展示在个人主页"}
                </button>
              </>
            ) : (
              <>
                {/* Progress */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs text-gray-400">解锁进度</span>
                    <span className="text-xs text-gray-500 font-medium">
                      {selectedBadge.currentProgress}/
                      {selectedBadge.conditionValue}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gray-300 to-gray-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (selectedBadge.currentProgress /
                            selectedBadge.conditionValue) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    {selectedBadge.conditionValue -
                      selectedBadge.currentProgress >
                    0
                      ? `还需 ${
                          selectedBadge.conditionValue -
                          selectedBadge.currentProgress
                        } 更多`
                      : "即将解锁"}
                  </p>
                </div>

                {/* Locked status */}
                <div className="w-full py-3.5 rounded-2xl text-sm font-semibold bg-gray-50 text-gray-400 text-center border border-gray-100">
                  <Lock
                    size={14}
                    className="inline-block mr-1.5 -mt-0.5"
                  />
                  未解锁
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MedalWall;
