import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

import App from "./App";

import Login from "./pages/Login";
import Register from "./pages/Register";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Users from "./pages/Users";
import Staff from "./pages/Staff";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/contextapi";
import Documents from "./pages/document.jsx";
import AskAI from "./pages/AskAI";
import AISearch from "./pages/AISearch.jsx";
import { LoadingProvider } from "./context/loadingContext.jsx";
import GlobalLoader from "./components/GlobalLoader.jsx";
import Profile from "./pages/Profile.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },

  {
    path: "/admin",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "attendance",
        element: <Attendance />,
      },
      {
        path: "documentupload",
        element: <Documents />,
      },
      { path: "ai-assistant", element: <AskAI /> },
    ],
  },

  {
    path: "/manager",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "attendance",
        element: <Attendance />,
      },
      { path: "staff", element: <Staff /> },
      { path: "ai-assistant", element: <AskAI /> },
      { path: "ai-search", element: <AISearch /> },
    ],
  },

  {
    path: "/staff",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "attendance",
        element: <Attendance />,
      },
      { path: "profile", element: <Profile /> },
      { path: "ai-assistant", element: <AskAI /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <AuthProvider>
      <LoadingProvider>
        <RouterProvider router={router} />
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
        <GlobalLoader />
      </LoadingProvider>
    </AuthProvider>
  </>,
);
