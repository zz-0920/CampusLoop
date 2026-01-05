import request from "../utils/request";

export interface UserProfile {
  id: number;
  username: string;
  name: string;
  avatar?: string;
  school?: string;
  department?: string;
  bio?: string;
  isVerified?: boolean;
  createdAt: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  isMutual: boolean;
  isSelf: boolean;
}

export interface FollowUser {
  id: number;
  username: string;
  name: string;
  avatar?: string;
  school?: string;
  department?: string;
  bio?: string;
  isVerified?: boolean;
  isFollowing: boolean;
  isFollowedBy: boolean;
  isMutual: boolean;
  isSelf: boolean;
}

export interface FollowListResponse {
  users: FollowUser[];
  total: number;
  page: number;
  totalPages: number;
}

export const getUserProfile = async () => {
  return request.get("/user/profile");
};

export const getUserById = async (id: number): Promise<UserProfile> => {
  return request.get(`/user/${id}`) as unknown as Promise<UserProfile>;
};

export const getUserPosts = async (id: number, page = 1, limit = 10) => {
  return request.get(`/user/${id}/posts`, { params: { page, limit } });
};

export const toggleFollow = async (
  id: number
): Promise<{ isFollowing: boolean; isMutual: boolean }> => {
  return request.post(`/user/${id}/follow`) as unknown as Promise<{
    isFollowing: boolean;
    isMutual: boolean;
  }>;
};

export const getFollowers = async (
  id: number,
  page = 1,
  limit = 20
): Promise<FollowListResponse> => {
  return request.get(`/user/${id}/followers`, {
    params: { page, limit },
  }) as unknown as Promise<FollowListResponse>;
};

export const getFollowing = async (
  id: number,
  page = 1,
  limit = 20
): Promise<FollowListResponse> => {
  return request.get(`/user/${id}/following`, {
    params: { page, limit },
  }) as unknown as Promise<FollowListResponse>;
};
