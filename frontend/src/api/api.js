import Axios from "axios";
import {
  ShowGlobalLoader,
  HideGlobalLoader,
} from "../context/loadingContext.jsx";

const axios = Axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  ShowGlobalLoader();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};

const logoutAndRedirect = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

axios.interceptors.response.use(
  (response) => {
    HideGlobalLoader();
    return response;
  },
  async (error) => {
    HideGlobalLoader();

    const originalRequest = error.config;
    const authRoutes = ["/auth/login", "/auth/register", "/auth/refresh"];

    if (error.response) {
      const { status, data } = error.response;

      const isAuthError =
        status === 401 ||
        data?.message === "Token expired" ||
        data?.message === "Invalid token";

      if (
        isAuthError &&
        !authRoutes.includes(originalRequest.url) &&
        !originalRequest._retry
      ) {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          logoutAndRedirect();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data: refreshData } = await Axios.post(
            "http://localhost:5000/api/auth/refresh",
            { refreshToken },
          );

          const newAccessToken = refreshData.data.token;
          localStorage.setItem("token", newAccessToken);

          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          logoutAndRedirect();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // if (isAuthError && authRoutes.includes(originalRequest.url)) {
      //   logoutAndRedirect();
      // }
    }

    return Promise.reject(error);
  },
);

export default axios;
