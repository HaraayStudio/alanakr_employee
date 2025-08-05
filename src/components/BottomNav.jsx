import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./BottomNav.module.scss";
import { FiHome, FiCamera, FiUser, FiMail } from "react-icons/fi";

export default function BottomNav() {
  return (
    <nav className={styles.bottomNav}>
      <NavLink to="/home" className={({ isActive }) => isActive ? styles.active : ""}>
        <FiHome />
        <span>Home</span>
      </NavLink>
      <NavLink to="/camera" className={({ isActive }) => isActive ? styles.active : ""}>
        <FiCamera />
        <span>Camera</span>
      </NavLink>
      <NavLink to="/attendance" className={({ isActive }) => isActive ? styles.active : ""}>
        <FiMail />
        <span>Attendance</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => isActive ? styles.active : ""}>
        <FiUser />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
