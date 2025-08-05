// src/routes/Profile.jsx
import React from "react";
import styles from "./Profile.module.scss";
import { useData } from "../context/dataContext";
import { User2, Calendar, Phone, Mail, IdCard, UserCheck, BadgePercent } from "lucide-react";

function getInitials(employee) {
  if (!employee) return "";
  const names = [employee.firstName, employee.lastName].filter(Boolean);
  return names.map(n => n[0]?.toUpperCase()).join("").slice(0, 2);
}

export default function Profile() {
  const { employee, loading, error } = useData();

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!employee) return <div className={styles.error}>No employee data.</div>;

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>
          <span>{getInitials(employee)}</span>
        </div>
        <div className={styles.empInfo}>
          <div className={styles.name}>{employee.firstName} {employee.lastName}</div>
          <div className={styles.roleStatus}>
            <span className={styles.role}>{employee.role}</span>
            <span className={`${styles.status} ${employee.status === "ACTIVE" ? styles.active : styles.inactive}`}>
              {employee.status}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionRow}>
          <User2 size={18} />
          <span>{employee.gender || "—"}</span>
        </div>
        <div className={styles.sectionRow}>
          <Calendar size={18} />
          <span>DOB: {employee.birthDate ? new Date(employee.birthDate).toLocaleDateString() : "—"}</span>
        </div>
        <div className={styles.sectionRow}>
          <BadgePercent size={18} />
          <span>Blood Group: {employee.bloodGroup?.toUpperCase() || "—"}</span>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionRow}>
          <Mail size={18} />
          <span>{employee.email}</span>
        </div>
        <div className={styles.sectionRow}>
          <Phone size={18} />
          <span>{employee.phone || "—"}</span>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionRow}>
          <UserCheck size={18} />
          <span>Joined: {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : "—"}</span>
        </div>
        {employee.leaveDate && (
          <div className={styles.sectionRow}>
            <UserCheck size={18} />
            <span>Left: {new Date(employee.leaveDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionRow}>
          <IdCard size={18} />
          <span>Aadhaar: {employee.adharNumber || "—"}</span>
        </div>
        <div className={styles.sectionRow}>
          <IdCard size={18} />
          <span>PAN: {employee.panNumber || "—"}</span>
        </div>
      </div>
    </div>
  );
}
