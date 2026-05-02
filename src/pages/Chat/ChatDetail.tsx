import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Phone, Video } from "lucide-react";
import { getMessages, sendMessage } from "../../services/messageService";
import { getUserById } from "../../services/userService";
import { useSocket } from "../../context/SocketContext";
import Avatar from "../../components/Avatar";

interface Message {
  id?: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt?: string;
}

interface User {
  id: number;
  username: string;
  name?: string;
  avatar?: string;
}

const ChatDetail: React.FC = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [contactUser, setContactUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  // Read user from localStorage synchronously using useMemo
  const currentUser = React.useMemo<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? (JSON.parse(stored) as User) : null;
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch contact user info
  useEffect(() => {
    if (!contactId) return;
    const fetchContact = async () => {
      try {
        const data = await getUserById(Number(contactId));
        setContactUser(data as unknown as User);
      } catch (error) {
        console.error("Failed to load contact", error);
      }
    };
    fetchContact();
  }, [contactId]);

  useEffect(() => {
    if (!contactId) return;

    const fetchMessages = async () => {
      try {
        const data = (await getMessages(
          Number(contactId)
        )) as unknown as Message[];
        setMessages(data);
      } catch (error) {
        console.error("Failed to load messages", error);
      }
    };

    fetchMessages();
  }, [contactId]);

  useEffect(() => {
    if (!socket || !contactId) return;

    const handleMessage = (message: Message) => {
      if (message.senderId === Number(contactId)) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, [socket, contactId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!inputValue.trim() || !contactId) return;
    try {
      const newMsg = (await sendMessage({
        receiverId: Number(contactId),
        content: inputValue,
      })) as unknown as Message;
      setMessages((prev) => [...prev, newMsg]);
      setInputValue("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  // Format message time
  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `昨天 ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return `${date.getMonth() + 1}/${date.getDate()} ${date.toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" }
    )}`;
  };

  // Check if should show time separator
  const shouldShowTime = (index: number): boolean => {
    if (index === 0) return true;
    const prevMsg = messages[index - 1];
    const currentMsg = messages[index];
    if (!prevMsg.createdAt || !currentMsg.createdAt) return false;
    const prevTime = new Date(prevMsg.createdAt).getTime();
    const currentTime = new Date(currentMsg.createdAt).getTime();
    return currentTime - prevTime > 5 * 60 * 1000; // 5 minutes gap
  };

  return (
    <div className="flex flex-col h-screen bg-white font-display">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="text-black p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => contactId && navigate(`/user/${contactId}`)}
          >
            <Avatar
              src={contactUser?.avatar}
              alt={contactUser?.name || "用户"}
              size="sm"
            />
            <div>
              <h2 className="font-bold text-black text-sm leading-tight">
                {contactUser?.name || `用户 ${contactId}`}
              </h2>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span className="text-[10px] text-gray-500 font-medium">在线</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-black">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video size={20} />
          </button>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUser?.id;
          const showTime = shouldShowTime(index);

          return (
            <React.Fragment key={msg.id || index}>
              {/* Time separator */}
              {showTime && msg.createdAt && (
                <div className="flex justify-center my-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
              )}

              {/* Message bubble with avatar */}
              <div
                className={`flex gap-3 items-end ${
                  isMe ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <Avatar
                  src={isMe ? currentUser?.avatar : contactUser?.avatar}
                  size="sm"
                  className="shrink-0 mb-1"
                />

                {/* Message content */}
                <div
                  className={`flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  } max-w-[70%]`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-xl text-sm border cursor-default ${
                      isMe
                        ? "bg-black text-white border-black"
                        : "bg-gray-100 text-black border-gray-100"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            </React.Fragment>
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
            placeholder="打个招呼吧..."
            className="flex-1 bg-gray-50 border border-gray-100 rounded-full px-4 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-3 bg-black text-white rounded-full disabled:opacity-30 disabled:grayscale transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>

  );
};

export default ChatDetail;
