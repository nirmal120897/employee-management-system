import axios from "./api.js";

export const checkInApi = () => axios.post("/attendance/check-in");

export const checkOutApi = () => axios.post("/attendance/check-out");

export const myAttendanceApi = (page = 1, limit = 10) =>
  axios.get(`/attendance/me?page=${page}&limit=${limit}`);

export const allAttendanceApi = (page = 1, limit = 10) =>
  axios.get(`/attendance?page=${page}&limit=${limit}`);
