import request from "../utils/request";
import type { UploadResponse } from "../types";

// Type definitions
interface PostUser {
  id: number;
  name: string;
  avatar?: string;
  school?: string;
  department?: string;
  isVerified?: boolean;
}

interface Post {
  id: number;
  content: string;
  image?: string;
  createdAt: string;
  user: PostUser;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: PostUser;
}

interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  hasMore: boolean;
}

export const getPosts = async (params: {
  page?: number;
  limit?: number;
  tab?: string;
  type?: string;
}) => {
  return request.get("/posts", { params });
};

export const getPostById = async (id: number): Promise<Post> => {
  return request.get(`/posts/${id}`) as unknown as Promise<Post>;
};

export interface SearchResult {
  posts?: Post[];
  users?: {
    id: number;
    username: string;
    name: string;
    avatar?: string;
    school?: string;
    department?: string;
    bio?: string;
  }[];
  clubs?: {
    id: number;
    name: string;
    logo?: string;
    description?: string;
    memberCount: number;
  }[];
}

export const searchPosts = async (
  q: string,
  type: "all" | "posts" | "users" | "clubs" = "all"
): Promise<SearchResult> => {
  return request.get("/posts/search", {
    params: { q, type },
  }) as unknown as Promise<SearchResult>;
};

export const createPost = async (data: {
  content: string;
  image?: string;
  type?: string;
  isAnonymous?: boolean;
  location?: string;
}) => {
  return request.post("/posts", data);
};

export const interactPost = async (id: number, type: "like" | "bookmark") => {
  return request.post(`/posts/${id}/interact`, { type });
};

export const getComments = async (
  postId: number,
  page = 1,
  limit = 20
): Promise<CommentsResponse> => {
  return request.get(`/posts/${postId}/comments`, {
    params: { page, limit },
  }) as unknown as Promise<CommentsResponse>;
};

export const createComment = async (
  postId: number,
  content: string
): Promise<Comment> => {
  return request.post(`/posts/${postId}/comments`, {
    content,
  }) as unknown as Promise<Comment>;
};

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  return request.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getRandomPaperPlane = () => {
  return request.get("/posts/random-paper-plane");
};
