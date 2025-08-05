import React,{usestate } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import styles from "./App.module.scss";

import Home from "./routes/Home.jsx";
import Camera from "./routes/Camera.jsx";
import Attendance from "./routes/Attendance.jsx";
import Profile from "./routes/Profile.jsx";
import Login from "./routes/Login.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Header from "./components/Header.jsx";
import { DataProvider } from "./context/dataContext.jsx";

// Show BottomNav and Header only after login
function Layout() {
  const location = useLocation();
 
  const hideNav = location.pathname === "/login";
  return (
    <div className={styles.appContainer}>
      {!hideNav && <Header />}
      <div className={styles.content}>{!hideNav && <BottomNav />}</div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
     <DataProvider>
    <Router>
      <Layout />
    </Router> </DataProvider>
  );
}
