import request from "../utils/request";

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  name?: string;
  email?: string;
}

export const login = async (data: LoginData) => {
  return request.post("/auth/login", data);
};

export const register = async (data: RegisterData) => {
  return request.post("/auth/register", data);
};

export const getProfile = async () => {
  return request.get("/user/profile");
};

export const changePassword = async (data: { oldPassword?: string; newPassword?: string }) => {
  return request.post("/auth/change-password", data);
};
