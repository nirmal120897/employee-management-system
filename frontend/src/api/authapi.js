import axios from "./api.js";

export const registerApi = (data) => axios.post("/auth/register", data);

export const loginApi = (data) => axios.post("/auth/login", data);

export const meApi = () => axios.get("/auth/me");

export const refreshApi = () => axios.post("/auth/refresh");
