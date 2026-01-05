import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  unreadCount: number;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  unreadCount: 0,
  isConnected: false,
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    // Only connect if we have a token and user
    if (!token || !userStr || socketRef.current) return;

    const user = JSON.parse(userStr);

    // Auto-connect on mount if logged in
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
    });

    newSocket.on("disconnect", () => {
      console.log("Global Socket Disconnected");
      setIsConnected(false);
    });

    // Global listener for new messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newSocket.on("receive_message", (message: any) => {
      // Logic: If I am the receiver, increment unread count
      // In a real app, we might check if we are currently looking at this chat
      // For MVP, just increment global count
      if (message.receiverId === user.id) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    // Cleanup
    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
