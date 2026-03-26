import axios from "axios";

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/v1"
    : "https://4382-129-45-31-55.ngrok-free.app/api/v1";

// const baseURL =
//   window.location.hostname === "localhost"
//     ? "http://localhost:5000/api/v1"
//     : "https://10.250.236.83/api/v1";

const api = axios.create({
  baseURL ,
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired / invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
