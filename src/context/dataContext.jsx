// src/context/DataContext.jsx
import React, { createContext, useContext, useState } from "react";
import * as authApi from "../api/authApi"; // all API functions
import api from "../api/authApi";          // axios instance (with interceptor)

const DataContext = createContext();

export function DataProvider({ children }) {
  const [user, setUser] = useState(null);     // Authenticated user object (optional)
  const [token, setToken] = useState(null);
  const [employee, setEmploye] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // LOGIN
  const handleLogin = async (email, password) => {
    setLoading(true); setError("");
    try {
      const res = await authApi.login(email, password);
      setUser(res.data.user || null);
      setToken(res.data.accessToken || null);
      console.log(res);
      
      sessionStorage.setItem("token", res.data.accessToken);

      await fetchEmployeeData();   // Immediately fetch employee data on login

      setLoading(false);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setLoading(false);
      return { success: false, message: err.response?.data?.message || "Login failed" };
    }
  };

  // FETCH EMPLOYEE DATA
  const fetchEmployeeData = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/employees/getemployeedata");
      setEmploye(res.data.data);
    } catch (err) {
      setError("Failed to load employee data");
      setEmploye(null);
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
    setToken(null);
    setEmploye(null);
    sessionStorage.removeItem("token");
  };

  return (
    <DataContext.Provider
      value={{
        user, token, employee, loading, error, setEmploye,
        handleLogin, handleLogout, fetchEmployeeData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
