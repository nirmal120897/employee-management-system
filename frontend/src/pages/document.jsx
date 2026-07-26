import { useEffect, useState } from "react";
import {
  uploadDocumentApi,
  getAllDocumentsApi,
  deleteDocumentApi,
  parseDocumentApi,
  chunkDocumentApi,
} from "../api/document.api";
import Pagination from "../components/Pagination";

function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const fetchDocuments = async (targetPage = page) => {
    try {
      setLoading(true);
      const res = await getAllDocumentsApi(targetPage, 10);
      setDocuments(res.data.data.documents || []);
      setPagination(res.data.pagination || { totalPages: 1 });
    } catch (err) {
      console.log(">>>fetchDocuments error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => await fetchDocuments(page))();
  }, [page]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("PDF file select karo");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Only pdf File is allowed!!!");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);

      await uploadDocumentApi(formData);
      setTitle("");
      setFile(null);
      document.getElementById("pdfFileInput").value = "";
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do yo want to delete?")) return;
    try {
      await deleteDocumentApi(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleParse = async (id) => {
    setActionId(id);
    try {
      await parseDocumentApi(id);
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || "Parse failed");
    } finally {
      setActionId(null);
    }
  };

  const handleChunk = async (id) => {
    setActionId(id);
    try {
      const res = await chunkDocumentApi(id);
      alert(`Chunked into ${res.data.data.totalChunks} pieces`);
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || "Chunking failed");
    } finally {
      setActionId(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      PENDING: "bg-secondary",
      PROCESSING: "bg-warning text-dark",
      PARSED: "bg-success",
      FAILED: "bg-danger",
    };
    return (
      <span className={`badge ${map[status] || "bg-secondary"}`}>{status}</span>
    );
  };

  return (
    <div>
      <h3 className="mb-4">Documents</h3>

      <div className="card shadow-sm p-3 mb-4">
        <h6 className="mb-3">Upload New Document</h6>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={handleUpload} className="row g-2 align-items-end">
          <div className="col-md-5">
            <label className="form-label">Title</label>
            <input
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Employee Handbook 2026"
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">PDF File</label>
            <input
              id="pdfFileInput"
              type="file"
              accept="application/pdf"
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>
          <div className="col-md-3">
            <button
              className="btn btn-success w-100"
              type="submit"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <p>Loading documents...</p>
      ) : documents.length === 0 ? (
        <p className="text-muted">Koi document upload nahi hua abhi tak.</p>
      ) : (
        <div className="table-responsive card shadow-sm p-2">
          <table className="table table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th>Title</th>
                <th>Uploaded By</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.title}</td>
                  <td>{doc.uploader?.name || "-"}</td>
                  <td>{statusBadge(doc.status)}</td>
                  <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleParse(doc.id)}
                        disabled={actionId === doc.id}
                      >
                        {actionId === doc.id ? "..." : "Parse"}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleChunk(doc.id)}
                        disabled={actionId === doc.id}
                      >
                        {actionId === doc.id ? "..." : "Chunk"}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(doc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

export default KnowledgeBase;
