import { NavLink, Outlet, useNavigate } from "react-router-dom";

const MENU_ITEMS = {
  ADMIN: [
    { label: "Dashboard", path: "/admin", exact: true },
    { label: "Users", path: "/admin/users" },
    { label: "Attendance", path: "/admin/attendance" },
    { label: "Documents", path: "/admin/documentupload" },
    { label: "Reports", disabled: true },
    { label: "Settings", disabled: true },
    { label: "AI Assistant", path: "/admin/ai-assistant" },
  ],
  MANAGER: [
    { label: "Dashboard", path: "/manager", exact: true },
    { label: "Staff", path: "/manager/staff" },
    { label: "Attendance", path: "/manager/attendance" },
    { label: "AI Reports", disabled: true },
    { label: "AI Assistant", disabled: true },
    { label: "AI Search", path: "/manager/ai-search" },
  ],
  STAFF: [
    { label: "Dashboard", path: "/staff", exact: true },
    { label: "Attendance", path: "/staff/attendance" },
    { label: "AI Policy Assistant", disabled: true },
    { label: "Profile", path: "/staff/profile" },
    { label: "AI Assistant", path: "/admin/ai-assistant" },
  ],
};

function DashboardLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role || "STAFF";
  const menu = MENU_ITEMS[role] || MENU_ITEMS.STAFF;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshtoken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        className="d-flex flex-column p-3 text-white"
        style={{ width: "240px", background: "#14181f", flexShrink: 0 }}
      >
        <h5 className="mb-4 fw-bold" style={{ color: "#0f9d74" }}>
          Attendance
        </h5>
        <ul className="nav nav-pills flex-column gap-1">
          {menu.map((item) =>
            item.disabled ? (
              <li key={item.label} className="nav-item">
                <span
                  className="nav-link text-secondary"
                  style={{ opacity: 0.5, cursor: "not-allowed" }}
                >
                  {item.label}
                </span>
              </li>
            ) : (
              <li key={item.label} className="nav-item">
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    "nav-link text-white" + (isActive ? " active" : "")
                  }
                  style={({ isActive }) => ({
                    background: isActive ? "#0f9d74" : "transparent",
                  })}
                >
                  {item.label}
                </NavLink>
              </li>
            ),
          )}
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Navbar */}
        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">
          <div>
            <strong>{user?.name || "User"}</strong>
            <span className="badge bg-secondary ms-2">{role}</span>
          </div>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* Page content */}
        <div className="p-4 flex-grow-1" style={{ background: "#f4f6f8" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
