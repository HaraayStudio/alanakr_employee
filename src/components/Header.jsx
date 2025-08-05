import React from "react";
import styles from "./Header.module.scss";
import logo from "../assets/logo.png"; // Use your logo
import { HiOutlineMenuAlt3 } from "react-icons/hi"; // Install react-icons if needed

export default function Header() {
  return (
    <header className={styles.header}>
      <img src={logo} alt="Alankar Logo" className={styles.logo} />
      <button className={styles.menuBtn}>
        <HiOutlineMenuAlt3 size={26} />
      </button>
    </header>
  );
}
