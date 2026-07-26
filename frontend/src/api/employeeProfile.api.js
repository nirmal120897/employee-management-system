import axios from "../api/api.js";

export const createProfileApi = (data) =>
  axios.post("/employee-profiles", data);
export const getAllProfilesApi = () => axios.get("/employee-profiles");
export const deleteProfileApi = (id) =>
  axios.delete(`/employee-profiles/${id}`);
export const searchProfilesApi = (query) =>
  axios.post("/employee-profiles/search", { query });
