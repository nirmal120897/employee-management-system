import { useEffect, useState } from "react";
import { meApi } from "../api/authapi.js";
import LiveAttendanceWidget from "../components/LiveAttendanceWidget.jsx";
function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await meApi();
        setUser(res.data.data);
      } catch (error) {
        console.log(">>>dashboard me error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h3 className="mb-4">Welcome, {user?.name} 👋</h3>
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <div className="text-muted small">Role</div>
            <div className="fs-4 fw-bold">{user?.role}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <div className="text-muted small">Email</div>
            <div className="fs-6 fw-semibold">{user?.email}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <div className="text-muted small">Member Since</div>
            <div className="fs-6 fw-semibold">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "-"}
            </div>
          </div>
        </div>
      </div>
      {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
        <div className="row mt-4">
          <div className="col-md-6">
            <LiveAttendanceWidget />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
