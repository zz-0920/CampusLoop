import request from "../utils/request";

export const getDiscoverUsers = async () => {
  return request.get("/discover/users");
};

export const getClubs = async () => {
  return request.get("/discover/clubs");
};
