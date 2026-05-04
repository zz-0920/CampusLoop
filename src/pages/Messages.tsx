import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  MessageSquare,
  Heart,
  Star,
  RefreshCw,
} from "lucide-react";
import { getConversations } from "../services/messageService";
import { getMyInteractions } from "../services/interactionService";
import type { Conversation } from "../types";
import type { InteractionNotification } from "../services/interactionService";

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"chat" | "interaction">("chat");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [interactions, setInteractions] = useState<InteractionNotification[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [interactionFilter, setInteractionFilter] = useState<
    string | undefined
  >(undefined);
  const [lastViewedTime, setLastViewedTime] = useState<number>(() => {
    const stored = localStorage.getItem("lastViewedInteractionTime");
    return stored ? Number(stored) : 0;
  });

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConversations();
      setConversations(data as unknown as Conversation[]);
    } catch (error) {
      console.error("Failed to load conversations", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInteractions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyInteractions(interactionFilter);
      setInteractions(data.interactions);
    } catch (error) {
      console.error("Failed to load interactions", error);
    } finally {
      setLoading(false);
    }
  }, [interactionFilter]);

  // Load both on mount
  useEffect(() => {
    loadConversations();
    loadInteractions();
  }, [loadConversations, loadInteractions]);

  // Reload based on active tab for latest data
  useEffect(() => {
    if (activeTab === "chat") {
      loadConversations();
    } else {
      loadInteractions();
    }
  }, [activeTab, loadConversations, loadInteractions]);



  const interactionTypes = [
    {
      type: undefined,
      label: "全部",
      icon: <RefreshCw size={16} />,
      bg: "bg-gray-100",
      color: "text-gray-500",
    },
    {
      type: "like",
      label: "点赞",
      icon: <Heart size={16} />,
      bg: "bg-pink-50",
      color: "text-pink-500",
    },
    {
      type: "comment",
      label: "评论",
      icon: <MessageSquare size={16} />,
      bg: "bg-green-50",
      color: "text-green-500",
    },
    {
      type: "share",
      label: "转发",
      icon: <Users size={16} />,
      bg: "bg-blue-50",
      color: "text-blue-500",
    },
    {
      type: "bookmark",
      label: "收藏",
      icon: <Star size={16} />,
      bg: "bg-yellow-50",
      color: "text-yellow-500",
    },
  ];

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart size={14} className="text-pink-500" />;
      case "comment":
        return <MessageSquare size={14} className="text-green-500" />;
      case "share":
        return <Users size={14} className="text-blue-500" />;
      case "bookmark":
        return <Star size={14} className="text-yellow-500" />;
      default:
        return <Heart size={14} className="text-gray-400" />;
    }
  };

  const getInteractionText = (type: string) => {
    switch (type) {
      case "like":
        return "赞了你的帖子";
      case "comment":
        return "评论了你的帖子";
      case "share":
        return "转发了你的帖子";
      case "bookmark":
        return "收藏了你的帖子";
      default:
        return "与你互动";
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString();
  };
  // Calculate total unread messages
  const totalUnreadMessages = conversations.reduce(
    (acc, c) => acc + (c.unreadCount || 0),
    0
  );

  // Calculate unread interactions (only count those newer than last viewed time)
  const unreadInteractions = interactions.filter((i) => {
    const interactionTime = new Date(i.createdAt).getTime();
    return interactionTime > lastViewedTime;
  }).length;

  // Handle tab change
  const handleTabChange = (tab: "chat" | "interaction") => {
    setActiveTab(tab);
    if (tab === "interaction" && interactions.length > 0) {
      // Save current time as last viewed
      const now = Date.now();
      localStorage.setItem("lastViewedInteractionTime", String(now));
      setLastViewedTime(now);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* 1. Header & Tabs */}
        <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-50">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 p-1 rounded-xl flex gap-1 w-56">
              <button
                onClick={() => handleTabChange("chat")}
                className={`relative flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "chat"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-400"
                }`}
              >
                聊天
                {totalUnreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                    {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTabChange("interaction")}
                className={`relative flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "interaction"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-400"
                }`}
              >
                互动
                {unreadInteractions > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                    {unreadInteractions > 99 ? "99+" : unreadInteractions}
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="bg-gray-50 rounded-full flex items-center px-4 py-2 gap-2 text-gray-400">
            <Search size={16} />
            <span className="text-xs">搜索聊天记录/联系人</span>
          </div>
        </div>

        {activeTab === "chat" ? (
          <div className="flex-1 overflow-y-auto">
            {/* Interaction Entry Grid */}
            <div className="grid grid-cols-4 gap-2 p-4 border-b border-gray-50">
              {[
                {
                  label: "点赞",
                  icon: <Heart className="text-pink-500" />,
                  bg: "bg-pink-50",
                },
                {
                  label: "关注",
                  icon: <Users className="text-blue-500" />,
                  bg: "bg-blue-50",
                },
                {
                  label: "收藏",
                  icon: <Star className="text-yellow-500" />,
                  bg: "bg-yellow-50",
                },
                {
                  label: "评论",
                  icon: <MessageSquare className="text-green-500" />,
                  bg: "bg-green-50",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div
                    className={`${item.bg} p-3 rounded-2xl flex items-center justify-center`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[10px] text-gray-600 font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Private Messages List */}
            <section className="p-2">
              <h3 className="px-2 pt-2 pb-4 text-sm font-bold text-gray-800">
                私信列表
              </h3>
              <div className="space-y-1">
                {loading ? (
                  <div className="text-center py-4 text-gray-400 text-xs">
                    加载中...
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map((c) => (
                    <div
                      key={c.contact.id}
                      onClick={() => navigate(`/chat/${c.contact.id}`)}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={
                            c.contact.avatar ||
                            "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                          }
                          alt={c.contact.name}
                          loading="lazy"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {c.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                            {c.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-gray-800">
                            {c.contact.name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {c.lastMessage?.createdAt
                              ? new Date(
                                  c.lastMessage.createdAt
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate">
                          {c.lastMessage?.content || "暂无消息"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400 text-xs">
                    暂无消息
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Interaction Filter Tabs */}
            <div className="flex gap-2 p-4 border-b border-gray-50 overflow-x-auto no-scrollbar">
              {interactionTypes.map((item) => (
                <button
                  key={item.type || "all"}
                  onClick={() => setInteractionFilter(item.type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    interactionFilter === item.type
                      ? `${item.bg} ${item.color}`
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            {/* Interaction List */}
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="text-center py-10 text-gray-400 text-xs">
                  加载中...
                </div>
              ) : interactions.length > 0 ? (
                interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    onClick={() => navigate(`/post/${interaction.post.id}`)}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    {/* User Avatar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/${interaction.user.id}`);
                      }}
                    >
                      <img
                        src={
                          interaction.user.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${interaction.user.id}`
                        }
                        alt={interaction.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm font-medium text-gray-800">
                          {interaction.user.name}
                        </span>
                        {getInteractionIcon(interaction.type)}
                        <span className="text-xs text-gray-500">
                          {getInteractionText(interaction.type)}
                        </span>
                      </div>
                      {interaction.type === "comment" &&
                        interaction.content && (
                          <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                            "{interaction.content}"
                          </p>
                        )}
                      <p className="text-[10px] text-gray-400">
                        {formatTime(interaction.createdAt)}
                      </p>
                    </div>

                    {/* Post Thumbnail */}
                    {interaction.post.image && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                        <img
                          src={interaction.post.image.split(",")[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <MessageSquare size={48} className="mb-3 opacity-30" />
                  <span className="text-xs">暂无互动通知</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
