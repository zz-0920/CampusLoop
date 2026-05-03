import request from "../utils/request";

export const getConversations = async () => {
  return request.get("/messages/conversations");
};

export const getMessages = async (contactId: number) => {
  return request.get(`/messages/${contactId}`);
};

export const getPublicMessages = async () => {
  return request.get("/messages/public");
};

export const getClubMessages = async (clubId: number) => {
  return request.get(`/messages/club/${clubId}`);
};

export const sendMessage = async (data: {
  receiverId?: number;
  clubId?: number;
  isPublic?: boolean;
  content: string;
}) => {
  return request.post("/messages", data);
};

export const markAsRead = async (contactId: number) => {
  return request.post(`/messages/${contactId}/read`, {});
};
