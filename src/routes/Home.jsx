

import React, { useEffect, useState } from "react";
import styles from "./Home.module.scss";
import api from "../api/authApi"
import { Eye } from "lucide-react";
import JobSheetPopup from "./JobSheetPopup.jsx";
import { useData } from "../context/dataContext";
import JobSheetDetailPopup  from "./JobSheetDetailPopup"
export default function HomePage() {
    const { setEmploye  } = useData();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAddJobPopup, setShowAddJobPopup] = useState(false);

  useEffect(() => {
    async function fetchEmployeeData() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/employees/getemployeedata");
        setEmployee(res.data.data);
        setEmploye(res.data.data);
        console.log(res.data.data);
      } catch (err) {
        setError("Failed to load employee data");
      } finally {
        setLoading(false);
      }
   
    }
    fetchEmployeeData();

  }, []);

  
  return (
    <div className={styles.homePage}>
      {/* Top stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div>New Task</div>
          <div className={styles.statValue}>{employee?.jobSheets?.length || 0}</div>
        </div>
        <div className={styles.statCard}>
          <div>Last Jobsheet</div>
          <div className={styles.statValue}>
            {employee?.jobSheets?.[0]?.srNumber || "-"}
          </div>
        </div>
      </div>
      {/* Add Job Sheet */}
      <div className={styles.headerRow}>
        <div className={styles.title}>Job Sheet</div>
     <button className={styles.addBtn} onClick={() => setShowAddJobPopup(true)}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <g clip-path="url(#clip0_446_3)">
    <path d="M8 1V15M15 8H1" stroke="#030304" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_446_3">
      <rect width="16" height="16" fill="white"/>
    </clipPath>
  </defs>
</svg> Add Job sheet</button>
      </div>
      {/* Job Sheet List */}
    {/* Job Sheet List */}
<div className={styles.jobsheetList}>
  {loading ? (
    <div className={styles.loading}>Loading...</div>
  ) : error ? (
    <div className={styles.error}>{error}</div>
  ) : employee?.jobSheets?.length ? (
    employee.jobSheets.map((job) => (
      <div className={styles.jobCard} key={job.srNumber}>
        <div className={styles.jobHeader}>
          <div className={styles.srNumber}>
            {job.srNumber < 10 ? `0${job.srNumber}` : job.srNumber}
          </div>
          <div className={styles.jobTitle}>{job.description || "Job Sheet"}</div>
          <div className={styles.date}>
            <span className={styles.icon}>
              <svg width="14" height="14"><rect width="14" height="14" rx="3" fill="#dde4eb" /></svg>
            </span>
            {job.date ? new Date(job.date).toLocaleDateString() : ""}
          </div>
        </div>
        <div className={styles.clientRow}>
          <div>
            <div className={styles.label}>Client Name</div>
            <div className={styles.value}>
              {job.client?.name || "-"}
            </div>
          </div>
          <div>
            <div className={styles.label}>Contact Person</div>
            <div className={styles.value}>
              {job.contactPerson || "-"}
            </div>
          </div>
        </div>
       <button className={styles.viewBtn} onClick={() => setSelectedJob(job)}>
  <Eye size={18} /> View more
</button>
      </div>
    ))
  ) : (
    <div className={styles.noData}>No Job Sheets Assigned.</div>
  )}
</div>

      {/* See all */}
      <div className={styles.seeAllWrapper}>
        {/* <button className={styles.seeAllBtn}>See all</button> */}
      </div>

      <JobSheetDetailPopup
  open={!!selectedJob}
  job={selectedJob}
  onClose={() => setSelectedJob(null)}
  onNext={() => {/* logic for next job, or just close */}}
  onBack={() => {/* logic for previous job, or just close */}}
/>
{/* <JobSheetPopup
  open={showAddJobPopup}
  onClose={() => setShowAddJobPopup(false)}
  preSelectedEmployee={employee}
  onSuccess={() => }
/> */}

    </div>
  );
}
