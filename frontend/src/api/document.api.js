import axios from "./api.js";

export const uploadDocumentApi = (formData) =>
  axios.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getAllDocumentsApi = () => axios.get("/documents");
export const deleteDocumentApi = (id) => axios.delete(`/documents/${id}`);
export const parseDocumentApi = (id) => axios.post(`/documents/${id}/parse`);
export const chunkDocumentApi = (id) => axios.post(`/documents/${id}/chunk`);
