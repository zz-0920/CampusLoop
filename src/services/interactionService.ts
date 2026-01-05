import request from "../utils/request";

export interface InteractionUser {
  id: number;
  name: string;
  avatar?: string;
  isVerified?: boolean;
}

export interface InteractionPost {
  id: number;
  content: string;
  image?: string;
}

export interface InteractionNotification {
  id: number;
  type: "like" | "comment" | "share" | "bookmark";
  user: InteractionUser;
  post: InteractionPost;
  content?: string;
  createdAt: string;
}

export interface InteractionListResponse {
  interactions: InteractionNotification[];
  total: number;
  page: number;
  totalPages: number;
}

export interface InteractionCounts {
  like: number;
  comment: number;
  share: number;
  total: number;
}

export const getMyInteractions = async (
  type?: string,
  page = 1,
  limit = 20
): Promise<InteractionListResponse> => {
  const params: { page: number; limit: number; type?: string } = {
    page,
    limit,
  };
  if (type) {
    params.type = type;
  }
  return request.get("/interactions/my", {
    params,
  }) as unknown as Promise<InteractionListResponse>;
};

export const getMyInteractionCounts = async (): Promise<InteractionCounts> => {
  return request.get(
    "/interactions/my/counts"
  ) as unknown as Promise<InteractionCounts>;
};
