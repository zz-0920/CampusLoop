import request from "../utils/request";

export const getEvents = () => {
  return request.get("/events");
};

export const createEvent = (data: {
  title: string;
  date: string;
  location: string;
  description?: string;
  image?: string;
  clubId: number;
}) => {
  return request.post("/events", data);
};

export const getOwnedClubs = () => {
  return request.get("/user/owned-clubs");
};
