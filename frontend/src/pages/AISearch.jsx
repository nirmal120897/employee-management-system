import { useEffect, useState } from "react";
import {
  createProfileApi,
  getAllProfilesApi,
  searchProfilesApi,
} from "../api/employeeProfile.api";
import { getMyStaffApi } from "../api/userapi.js"; // Manager ke liye already bani hai

function AISearch() {
  const [profiles, setProfiles] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    skills: "",
    department: "",
    experience: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const fetchData = async () => {
    try {
      const [profilesRes, staffRes] = await Promise.all([
        getAllProfilesApi(),
        getMyStaffApi(1, 100),
      ]);
      setProfiles(profilesRes.data.data || []);
      setStaffList(staffRes.data.data.data || []);
    } catch (err) {
      console.log(">>>fetchData error", err);
    }
  };

  useEffect(() => {
    (async () => await fetchData())();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createProfileApi({
        userId: formData.userId,
        name: formData.name,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        department: formData.department,
        experience: formData.experience,
      });
      setFormData({
        userId: "",
        name: "",
        skills: "",
        department: "",
        experience: "",
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await searchProfilesApi(searchQuery);
      setSearchResults(res.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4">AI Employee Search</h3>

      {/* Semantic Search */}
      <div className="card shadow-sm p-3 mb-4">
        <h6 className="mb-3">
          Search Employees (e.g. "React developer with 2+ years")
        </h6>
        <form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
          <input
            className="form-control"
            placeholder="Describe what you're looking for..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="btn btn-success"
            type="submit"
            disabled={searching}
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        {searchResults && (
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Skills</th>
                  <th>Experience</th>
                  <th>Match</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-muted text-center">
                      No matches found
                    </td>
                  </tr>
                ) : (
                  searchResults.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.department}</td>
                      <td>
                        {Array.isArray(r.skills)
                          ? r.skills.join(", ")
                          : r.skills}
                      </td>
                      <td>{r.experience}</td>
                      <td>
                        <span className="badge bg-info">
                          {(r.similarity * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Profile */}
      <div className="card shadow-sm p-3 mb-4">
        <h6 className="mb-3">Add Employee Profile</h6>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form
          onSubmit={handleCreateProfile}
          className="row g-2 align-items-end"
        >
          <div className="col-md-2">
            <label className="form-label">Employee</label>
            <select
              className="form-select"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
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
          <div className="col-md-3">
            <label className="form-label">Skills (comma separated)</label>
            <input
              className="form-control"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Department</label>
            <input
              className="form-control"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Experience</label>
            <input
              className="form-control"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="2 years"
              required
            />
          </div>
          <div className="col-md-1">
            <button
              className="btn btn-success w-100"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "..." : "Add"}
            </button>
          </div>
        </form>
      </div>

      {/* Existing profiles list */}
      <div className="table-responsive card shadow-sm p-2">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Skills</th>
              <th>Experience</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.department}</td>
                <td>
                  {Array.isArray(p.skills) ? p.skills.join(", ") : p.skills}
                </td>
                <td>{p.experience}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AISearch;
