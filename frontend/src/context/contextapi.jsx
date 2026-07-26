import { createContext, useContext, useState, useEffect } from "react";
import { meApi } from "../api/authapi.js";
import { ShowGlobalLoader } from "./loadingContext.jsx";
// import GlobalLoader from "../components/GlobalLoader.jsx";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await meApi();
      setUser(res.data.data); // { id, name, email, role, managerId, createdAt }
    } catch (error) {
      console.log(" ..error", error);
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchUser();
    };

    load();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) {
    return <ShowGlobalLoader />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UseAuth = () => useContext(AuthContext);
