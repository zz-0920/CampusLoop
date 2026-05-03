import request from "../utils/request";

export const createClub = (data: { name: string; description?: string; logo?: string }) => {
  return request.post("/clubs", data);
};

export const getClubById = (id: number) => {
  return request.get(`/clubs/${id}`);
};
