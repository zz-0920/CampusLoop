import request from "../utils/request";

export const createClub = (data: { name: string; description?: string; logo?: string }) => {
  return request.post("/clubs", data);
};
