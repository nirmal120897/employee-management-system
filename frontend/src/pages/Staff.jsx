import { useEffect, useState } from "react";
import { getMyStaffApi, createUserApi, updateUserApi } from "../api/userapi.js";
import { UseAuth } from "../context/contextapi.jsx";
import Pagination from "../components/Pagination";
import socket from "../socket.js";

function Staff() {
  const { user } = UseAuth();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
    managerId: user?.id,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingStaff, setEditingStaff] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const fetchStaff = async (targetPage = page) => {
    try {
      setLoading(true);
      const res = await getMyStaffApi(targetPage, 10);
      setStaff(res.data.data.data || []);
      setPagination(res.data.pagination || { totalPages: 1 });
    } catch (err) {
      console.log(">>>fetchStaff error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchStaff(page);
    };
    load();
  }, [page]);

  useEffect(() => {
    const refreshOnUpdate = () => {
      fetchStaff(page);
    };

    if (socket.connected) {
      socket.on("employee_checked_in", refreshOnUpdate);
      socket.on("employee_checked_out", refreshOnUpdate);
    } else {
      socket.once("connect", () => {
        socket.on("employee_checked_in", refreshOnUpdate);
        socket.on("employee_checked_out", refreshOnUpdate);
      });
    }

    return () => {
      socket.off("employee_checked_in", refreshOnUpdate);
      socket.off("employee_checked_out", refreshOnUpdate);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createUserApi(formData);
      setFormData({ name: "", email: "", password: "", role: "MANAGER" });
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create staff");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (member) => {
    setEditingStaff(member);
    setEditForm({ name: member.name, email: member.email });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUserApi(editingStaff.id, editForm);
      setEditingStaff(null);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div>
      <h3 className="mb-4">My Staff</h3>

      <div className="card shadow-sm p-3 mb-4">
        <h6 className="mb-3">Add New Staff</h6>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={handleCreate} className="row g-2 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-success w-100"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Staff"}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <p>Loading staff...</p>
      ) : staff.length === 0 ? (
        <p className="text-muted">No staff assigned to you yet.</p>
      ) : (
        <div className="table-responsive card shadow-sm p-2">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openEdit(s)}
                    >
                      Edit
                    </button>
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

      {editingStaff && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Edit Staff</h5>
              <form onSubmit={handleUpdate}>
                <div className="mb-2">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingStaff(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;
