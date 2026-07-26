import axios from "./api.js";

export const getAllUsersApi = (page = 1, limit = 10) =>
  axios.get(`/users?page=${page}&limit=${limit}`);
export const createUserApi = (data) => axios.post("/users", data);
export const deleteUserApi = (id) => axios.delete(`/users/${id}`);
export const getMyStaffApi = (page = 1, limit = 10) =>
  axios.get(`/users/my-staff?page=${page}&limit=${limit}`);
export const updateUserApi = (id, data) => axios.patch(`/users/${id}`, data);
export const assignManagerApi = (id, managerId) =>
  axios.patch(`/users/${id}/assign-manager`, { managerId });
export const getmanagers = () => axios.get("/users/managers");
