export interface User {
  id: number;
  username: string;
  name: string;
  avatar?: string;
  school?: string;
  department?: string;
  bio?: string;
  isVerified?: boolean;
  _count?: {
    posts: number;
    followedBy: number;
    following: number;
    interactions: number;
    clubs: number;
  };
}

export interface UploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId?: number;
  clubId?: number;
  isPublic?: boolean;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Club {
  id: string | number;
  name: string;
  logo: string;
  memberCount: number;
}

export interface Conversation {
  contact: User;
  lastMessage?: Message;
  unreadCount: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description?: string;
  image?: string;
  clubId: number;
  club?: Club;
}
