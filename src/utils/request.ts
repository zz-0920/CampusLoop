import axios from "axios";

const request = axios.create({
  baseURL: "/api", // Proxy will handle this
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized (e.g., redirect to login)
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        // window.location.href = '/login'; // Optional: Redirect if unauthorized
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default request;
