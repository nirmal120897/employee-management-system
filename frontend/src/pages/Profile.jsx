import { UseAuth } from "../context/contextapi.jsx";

function Profile() {
  const { user, loading } = UseAuth();

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p className="text-muted">Unable to load profile.</p>;

  return (
    <div>
      <h3 className="mb-4">My Profile</h3>
      <div className="card shadow-sm p-4" style={{ maxWidth: "500px" }}>
        <div className="mb-3">
          <div className="text-muted small">Name</div>
          <div className="fs-5 fw-semibold">{user.name}</div>
        </div>
        <div className="mb-3">
          <div className="text-muted small">Email</div>
          <div className="fs-6">{user.email}</div>
        </div>
        <div className="mb-3">
          <div className="text-muted small">Role</div>
          <span className="badge bg-secondary">{user.role}</span>
        </div>
        <div>
          <div className="text-muted small">Member Since</div>
          <div className="fs-6">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;