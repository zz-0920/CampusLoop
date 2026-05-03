import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Send, Users, Info } from "lucide-react";
import { getClubMessages, getPublicMessages, sendMessage } from "../../services/messageService";
import { getClubById } from "../../services/clubService";
import { useSocket } from "../../context/SocketContext";
import Avatar from "../../components/Avatar";

interface Message {
  id?: number;
  senderId: number;
  receiverId?: number;
  clubId?: number;
  isPublic?: boolean;
  content: string;
  createdAt?: string;
  sender?: {
    name?: string;
    avatar?: string;
  };
}

interface User {
  id: number;
  username: string;
  name?: string;
  avatar?: string;
}

const GroupChatDetail: React.FC = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [roomInfo, setRoomInfo] = useState<{ name: string; avatar?: string }>({
    name: isPublic ? "全校公共聊天室" : "加载中..."
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  // Fetch room info (Club details)
  useEffect(() => {
    if (isPublic) {
      // Already set in initial state
      return;
    }
    
    if (clubId) {
      const fetchClub = async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const response = (await getClubById(Number(clubId))) as any;
          const data = response.data || response;
          setRoomInfo({ name: data.name, avatar: data.logo });
        } catch (error) {
          console.error("Failed to load club info", error);
        }
      };
      fetchClub();
    }
  }, [clubId, isPublic]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let data: Message[] = [];
        if (isPublic) {
          data = (await getPublicMessages()) as unknown as Message[];
        } else if (clubId) {
          data = (await getClubMessages(Number(clubId))) as unknown as Message[];
        }
        // Reverse if backend returns desc, but usually we want chronological for chat
        setMessages(data.reverse()); 
      } catch (error) {
        console.error("Failed to load messages", error);
      }
    };
    fetchMessages();
  }, [clubId, isPublic]);

  // Socket setup
  useEffect(() => {
    if (!socket) return;

    const roomId = isPublic ? "public_room" : `club_${clubId}`;
    socket.emit("join_room", roomId);

    const handleMessage = (message: Message) => {
      // Check if message belongs to this room
      const belongs = isPublic ? message.isPublic : message.clubId === Number(clubId);
      if (belongs) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.emit("leave_room", roomId);
      socket.off("receive_message", handleMessage);
    };
  }, [socket, clubId, isPublic]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    try {
      const payload: { content: string; isPublic?: boolean; clubId?: number } = { content: inputValue };
      if (isPublic) {
        payload.isPublic = true;
      } else if (clubId) {
        payload.clubId = Number(clubId);
      }

      const newMsg = (await sendMessage(payload)) as unknown as Message;
      // Socket will also broadcast back, but typically we add it locally for instant feedback
      // Actually, if we add it here and socket broadcasts it, we might get duplicates.
      // Most socket implementations handle this by check senderId or unique msg ID.
      // For now, let's just let socket handle the update to be safe, OR add here and skip socket for me.
      // Let's add locally and ensure socket listener doesn't double-add.
      setMessages((prev) => [...prev, newMsg]);
      setInputValue("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-screen bg-white font-display">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="text-black p-1 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            {isPublic ? (
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                <Users size={16} />
              </div>
            ) : (
              <Avatar src={roomInfo?.avatar} size="sm" />
            )}
            <div>
              <h2 className="font-bold text-black text-sm leading-tight">
                {roomInfo?.name || "加载中..."}
              </h2>
              <span className="text-[10px] text-gray-500 font-medium">
                {isPublic ? "全校共享" : "社团群聊"}
              </span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
          <Info size={20} className="text-black" />
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white no-scrollbar">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUser?.id;
          const showSenderInfo = !isMe;

          return (
            <div
              key={msg.id || index}
              className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"} items-start`}
            >
              {showSenderInfo && (
                <Avatar
                  src={msg.sender?.avatar}
                  size="sm"
                  className="shrink-0 mt-1"
                />
              )}
              {!showSenderInfo && <div className="w-8" />} {/* Placeholder for alignment if needed */}

              <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                {showSenderInfo && (
                  <span className="text-[10px] font-bold text-gray-400 mb-1 px-1">
                    {msg.sender?.name || "用户"}
                  </span>
                )}
                <div
                  className={`px-4 py-2.5 rounded-xl text-sm border ${
                    isMe
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 text-black border-gray-100"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] text-gray-300 mt-1 px-1">
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0 z-10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isPublic ? "说点什么吧..." : "在社团里聊聊..."}
            className="flex-1 bg-gray-50 border border-gray-100 rounded-full px-4 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-3 bg-black text-white rounded-full disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatDetail;
