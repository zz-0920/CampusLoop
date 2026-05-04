import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  unreadCount: number;
  isConnected: boolean;
  connectSocket: () => void;
  disconnectSocket: () => void;
  refreshUnreadCount: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  unreadCount: 0,
  isConnected: false,
  connectSocket: () => {},
  disconnectSocket: () => {},
  refreshUnreadCount: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const refreshUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3000/api/messages/unread-count", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  const connectSocket = useCallback(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    // Only connect if we have a token and user
    if (!token || !userStr || socketRef.current) return;

    const user = JSON.parse(userStr);

    const newSocket = io("http://localhost:3000", {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log("Global Socket Connected:", newSocket.id);
      setIsConnected(true);
      setSocket(newSocket);

      // Fetch initial unread count
      refreshUnreadCount();
    });

    newSocket.on("disconnect", () => {
      console.log("Global Socket Disconnected");
      setIsConnected(false);
    });

    // Global listener for new messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newSocket.on("receive_message", (message: any) => {
      if (message.receiverId === user.id) {
        setUnreadCount((prev) => prev + 1);
      }
    });
  }, [refreshUnreadCount]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connectSocket();
    // Cleanup
    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, isConnected, connectSocket, disconnectSocket, refreshUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};
