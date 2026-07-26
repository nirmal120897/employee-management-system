import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

import {
  HouseDoor,
  People,
  CalendarCheck,
  Robot,
  Search,
  FileEarmarkText,
  Gear,
  PersonBadge,
  PersonCircle,
} from "react-bootstrap-icons";

export default function Sidebar() {
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const role = user?.role;

  const adminMenu = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: <HouseDoor />,
    },
    {
      title: "Users",
      path: "/admin/users",
      icon: <People />,
    },
    {
      title: "Attendance",
      path: "/admin/attendance",
      icon: <CalendarCheck />,
    },
    {
      title: "Documnets",
      path: "/admin/documents",
      icon: <FileEarmarkText />,
    },
    {
      title: "AI Assistant",
      path: "/admin/ai",
      icon: <Robot />,
    },
    {
      title: "Reports",
      path: "/admin/reports",
      icon: <FileEarmarkText />,
    },
    {
      title: "Settings",
      path: "/admin/settings",
      icon: <Gear />,
    },
    {
      title: "document",
      path: "/admin/documentupload",
      icon: <Document />,
    },
  ];

  const managerMenu = [
    {
      title: "Dashboard",
      path: "/manager",
      icon: <HouseDoor />,
    },
    {
      title: "Staff",
      path: "/manager/staff",
      icon: <People />,
    },
    {
      title: "Attendance",
      path: "/manager/attendance",
      icon: <CalendarCheck />,
    },
    {
      title: "AI Reports",
      path: "/manager/reports",
      icon: <Robot />,
    },
    {
      title: "AI Search",
      path: "/manager/search",
      icon: <Search />,
    },
  ];

  const staffMenu = [
    {
      title: "Dashboard",
      path: "/staff",
      icon: <HouseDoor />,
    },
    {
      title: "Check In",
      path: "/staff/check-in",
      icon: <CalendarCheck />,
    },
    {
      title: "Check Out",
      path: "/staff/check-out",
      icon: <CalendarCheck />,
    },
    {
      title: "Attendance",
      path: "/staff/attendance",
      icon: <FileEarmarkText />,
    },
    {
      title: "AI Assistant",
      path: "/staff/ai",
      icon: <Robot />,
    },
    {
      title: "Profile",
      path: "/staff/profile",
      icon: <PersonCircle />,
    },
  ];

  let menus = [];

  if (role === "ADMIN") menus = adminMenu;
  if (role === "MANAGER") menus = managerMenu;
  if (role === "STAFF") menus = staffMenu;

  return (
    <div
      className="bg-dark text-white p-3"
      style={{
        minHeight: "100vh",
      }}
    >
      <h4 className="text-center mb-4">
        <PersonBadge className="me-2" />
        HRMS
      </h4>

      <Nav className="flex-column">
        {menus.map((item) => (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
            className={`mb-2 rounded px-3 py-2 ${
              location.pathname === item.path
                ? "bg-primary text-white"
                : "text-light"
            }`}
          >
            <span className="me-2">{item.icon}</span>

            {item.title}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
}
