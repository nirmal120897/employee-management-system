import { useEffect, useState } from "react";
import {
  getAllUsersApi,
  createUserApi,
  deleteUserApi,
  updateUserApi,
  assignManagerApi,
  getmanagers,
} from "../api/userapi.js";
import Pagination from "../components/Pagination";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
    managerId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [assigningUser, setAssigningUser] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [Managers, setmanagers] = useState("");

  const fetchUsers = async (targetPage = page) => {
    try {
      setLoading(true);
      const res = await getAllUsersApi(targetPage, 10);
      const Res = await getmanagers();
      console.log(">>>>Rez", res);

      setUsers(res.data.data || []);
      setPagination(res.data.pagination || { totalPages: 1 });
      setmanagers(Res.data.data);
    } catch (err) {
      console.log(">>>fetchUsers error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => await fetchUsers(page))();
  }, [page]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "role" && value === "MANAGER" ? { managerId: "" } : {}),
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // MANAGER create karte time managerId backend ko bhejna hi nahi chahiye
      const payload =
        formData.role === "STAFF"
          ? formData
          : {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              role: formData.role,
            };

      await createUserApi(payload);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "STAFF",
        managerId: "",
      });

      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUserApi(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUserApi(editingUser.id, editForm);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const openAssignManager = (user) => {
    setAssigningUser(user);
    setSelectedManagerId(user.managerId || "");
  };

  const handleAssignManager = async (e) => {
    e.preventDefault();
    try {
      await assignManagerApi(assigningUser.id, selectedManagerId);
      setAssigningUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Assign manager failed");
    }
  };

  if (!users || !Managers) {
    return <h2>data loading.....</h2>;
  }

  return (
    <div>
      <h3 className="mb-4">Users</h3>

      <div className="card shadow-sm p-3 mb-4">
        <h6 className="mb-3">Create New User</h6>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={handleCreate} className="row g-2 align-items-end">
          <div className="col-md-2">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2">
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
          <div className="col-md-2">
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
            <label className="form-label">Role</label>
            <select
              className="form-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="STAFF">Staff</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>

          {formData.role === "STAFF" && (
            <div className="col-md-2">
              <label className="form-label">Manager</label>
              <select
                className="form-select"
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                required
              >
                <option value="">Select Manager</option>
                {Managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {/* {managers.length === 0 && (
                <small className="text-danger">
                  Pehle ek Manager create karo
                </small>
              )} */}
            </div>
          )}

          <div className="col-md-2">
            <button
              className="btn btn-success w-100"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="table-responsive card shadow-sm p-2">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge bg-secondary">{u.role}</span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openEdit(u)}
                      >
                        Edit
                      </button>
                      {u.role === "STAFF" && (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => openAssignManager(u)}
                        >
                          Assign Manager
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(u.id)}
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
      {editingUser && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Edit User</h5>
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
                    onClick={() => setEditingUser(null)}
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

      {assigningUser && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Assign Manager to {assigningUser.name}</h5>
              <form onSubmit={handleAssignManager}>
                <div className="mb-3">
                  <label className="form-label">Manager</label>
                  <select
                    className="form-select"
                    value={selectedManagerId}
                    onChange={(e) => setSelectedManagerId(e.target.value)}
                    required
                  >
                    <option value="">Select Manager</option>
                    {Managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setAssigningUser(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Assign
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

export default Users;
