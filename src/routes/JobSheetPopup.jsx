// import React, { useState, useEffect } from "react";
// import styles from "./JobSheetPopup.module.scss";

// import axios from "axios";
// import { BASE_URL } from "../api/constants";

// // Size schematic preview
// function SizeSchematic({ lHeight, rHeight, tWidth, bWidth, jobNum }) {
//   const leftHeightText = lHeight ? String(lHeight) : "L";
//   const rightHeightText = rHeight ? String(rHeight) : "R";
//   const topWidthText = tWidth ? String(tWidth) : "T";
//   const bottomWidthText = bWidth ? String(bWidth) : "B";

//   return (
//     <div style={{ width: "200px", height: "280px", maxWidth: "100%", margin: "10px auto" }}>
//       <svg
//         viewBox="0 0 200 280"
//         width="100%"
//         height="100%"
//         style={{
//           display: "block",
//           background: "#f8f9fa",
//           borderRadius: 12,
//           border: "1px solid #e5ebf7",
//         }}
//       >
//         <rect x="20" y="25" width="160" height="230" rx="6" fill="#fff" stroke="#ccc" strokeWidth="1.5" />
//         <line x1="30" y1="65" x2="170" y2="65" stroke="#444" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
//         <line x1="30" y1="215" x2="170" y2="215" stroke="#444" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
//         <line x1="45" y1="45" x2="45" y2="235" stroke="#444" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
//         <line x1="155" y1="45" x2="155" y2="235" stroke="#444" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
//         <rect x="75" y="52" width="50" height="18" rx="4" fill="#fff" stroke="#aaa" />
//         <text x="100" y="65" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#222">
//           {topWidthText}
//         </text>
//         <rect x="75" y="202" width="50" height="18" rx="4" fill="#fff" stroke="#aaa" />
//         <text x="100" y="215" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#222">
//           {bottomWidthText}
//         </text>
//         <rect x="25" y="131" width="35" height="18" rx="4" fill="#fff" stroke="#aaa" />
//         <text x="42.5" y="144" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#222">
//           {leftHeightText}
//         </text>
//         <rect x="140" y="131" width="35" height="18" rx="4" fill="#fff" stroke="#aaa" />
//         <text x="157.5" y="144" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#222">
//           {rightHeightText}
//         </text>
//         <text x="100" y="155" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#c5c9d6" opacity="0.6">
//           {jobNum ? String(jobNum).padStart(2, "0") : "01"}
//         </text>
//         <defs>
//           <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
//             <path d="M0,1.5 L7,4 L0,6.5" fill="#444" />
//           </marker>
//         </defs>
//       </svg>
//     </div>
//   );
// }

// export default function JobSheetPopup({ open, onClose, preSelectedEmployee, onSuccess }) {

//   const emptyJob = {
//     material: "",
//     description: "",
//     remark: "",
//     lHeight: "",
//     rHeight: "",
//     tWidth: "",
//     bWidth: "",
//     files: [],
//   };

//   const [form, setForm] = useState({
//     clientId: "",
//     employeeId: preSelectedEmployee?.id || "",
//     clientName: "",
//     contactPerson: "",
//     date: "",
//     instructions: "",
//     jobs: [{ ...emptyJob }],
//   });

//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (open) {
//       setForm({
//         clientId: "",
//         employeeId: preSelectedEmployee?.id || "",
//         clientName: "",
//         contactPerson: "",
//         date: "",
//         instructions: "",
//         jobs: [{ ...emptyJob }],
//       });
//     }
//   }, [open, preSelectedEmployee]);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleJobField = (idx, key, value) => {
//     setForm((prev) => {
//       const updatedJobs = prev.jobs.map((j, i) => (i === idx ? { ...j, [key]: value } : j));
//       return { ...prev, jobs: updatedJobs };
//     });
//   };

//   const handleJobFileChange = (idx, files) => {
//     if (!files || files.length === 0) return;
//     const fileArray = Array.from(files);
//     setForm((prev) => {
//       const updatedJobs = prev.jobs.map((j, i) => {
//         if (i === idx) {
//           const currentFiles = Array.isArray(j.files) ? j.files : [];
//           return { ...j, files: [...currentFiles, ...fileArray] };
//         }
//         return j;
//       });
//       return { ...prev, jobs: updatedJobs };
//     });
//   };

//   const handleRemoveJobImage = (jobIdx, fileIdx) => {
//     setForm((prev) => {
//       const updatedJobs = prev.jobs.map((j, i) => {
//         if (i === jobIdx) {
//           const currentFiles = Array.isArray(j.files) ? j.files : [];
//           return { ...j, files: currentFiles.filter((_, k) => k !== fileIdx) };
//         }
//         return j;
//       });
//       return { ...prev, jobs: updatedJobs };
//     });
//   };

//   const addJob = () => setForm((prev) => ({ ...prev, jobs: [...prev.jobs, { ...emptyJob }] }));
//   const removeJob = (idx) =>
//     setForm((prev) => ({
//       ...prev,
//       jobs: prev.jobs.length === 1 ? prev.jobs : prev.jobs.filter((_, i) => i !== idx),
//     }));

//   const createFilePreview = (file) => {
//     try {
//       return URL.createObjectURL(file);
//     } catch (error) {
//       console.error("Error creating file preview:", error);
//       return null;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.clientId || !form.employeeId || !form.date) {
//       alert("Please fill all required fields.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const jobSheetData = {
//         client: { id: parseInt(form.clientId) },
//         employee: { id: parseInt(form.employeeId) },
//         clientName: form.clientName || "",
//         contactPerson: form.contactPerson || "",
//         date: form.date,
//         instructions: form.instructions || "",
//         jobs: form.jobs.map((job) => ({
//           material: job.material || "",
//           description: job.description || "",
//           remark: job.remark || "",
//           lHeight: job.lHeight || "",
//           rHeight: job.rHeight || "",
//           tWidth: job.tWidth || "",
//           bWidth: job.bWidth || "",
//           jobSheet: null,
//           images: [],
//         })),
//       };

//       const formData = new FormData();
//       formData.append("jobSheet", JSON.stringify(jobSheetData));
//       form.jobs.forEach((job, jobIndex) => {
//         if (Array.isArray(job.files) && job.files.length > 0) {
//           job.files.forEach((file) => formData.append(`jobImages[${jobIndex}]`, file));
//         }
//       });

//       const token = sessionStorage.getItem("token");
//       const res = await axios.post(`${BASE_URL}/jobsheet/createJobSheet`, formData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.data?.status === 201 || res.status === 201 || res.data?.status === 200 || res.status === 200) {
//         alert("Job Sheet created successfully!");
//         onClose();
//         if (onSuccess) onSuccess();
//       } else {
//         throw new Error(res.data?.message || "Error creating Job Sheet");
//       }
//     } catch (err) {
//       console.error("Submit error:", err);
//       let errorMessage = "Failed to create Job Sheet!";
//       if (err?.response?.data?.message) errorMessage = err.response.data.message;
//       else if (err?.response?.data)
//         errorMessage = typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data);
//       else if (err?.message) errorMessage = err.message;
//       alert(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className={styles.overlay}>
//       <div className={styles.popup}>
//         <h2>Add Job Sheet</h2>
//         <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
//           <div className={styles.row}>
//             <label>
//               Client <span>*</span>
//               <input
//                 type="text"
//                 name="clientId"
//                 value={form.clientId}
//                 onChange={handleChange}
//                 placeholder="Enter client ID"
//                 required
//               />
//             </label>
//             <label>
//               Employee <span>*</span>
//               <input
//                 type="text"
//                 name="employeeId"
//                 value={form.employeeId}
//                 onChange={handleChange}
//                 placeholder="Enter employee ID"
//                 required
//                 disabled={!!preSelectedEmployee}
//               />
//             </label>
//           </div>
//           <div className={styles.row}>
//             <label>
//               Client Name
//               <input
//                 type="text"
//                 name="clientName"
//                 value={form.clientName}
//                 onChange={handleChange}
//                 placeholder="Client name"
//               />
//             </label>
//             <label>
//               Contact Person
//               <input
//                 type="text"
//                 name="contactPerson"
//                 value={form.contactPerson}
//                 onChange={handleChange}
//                 placeholder="Contact person name"
//               />
//             </label>
//           </div>
//           <div className={styles.row}>
//             <label>
//               Date <span>*</span>
//               <input type="date" name="date" value={form.date} onChange={handleChange} required />
//             </label>
//             <label style={{ flex: 1 }}>
//               Instructions
//               <input
//                 type="text"
//                 name="instructions"
//                 value={form.instructions}
//                 onChange={handleChange}
//                 placeholder="Instructions (optional)"
//               />
//             </label>
//           </div>
//           <hr style={{ margin: "18px 0 10px 0", border: 0, borderTop: "1.5px solid #e5ebf7" }} />

//           {/* JOBS */}
//           <div className={styles.jobsSection}>
//             <div style={{ fontWeight: 600, fontSize: "1.05rem", color: "#274787", marginBottom: 10 }}>Job Items</div>
//             {form.jobs.map((job, idx) => (
//               <div key={idx} className={styles.jobCard}>
//                 <div className={styles.row}>
//                   <label>
//                     <span>Material</span>
//                     <input
//                       type="text"
//                       value={job.material}
//                       onChange={(e) => handleJobField(idx, "material", e.target.value)}
//                       placeholder="Material"
//                     />
//                   </label>
//                   <label>
//                     <span>Description</span>
//                     <input
//                       type="text"
//                       value={job.description}
//                       onChange={(e) => handleJobField(idx, "description", e.target.value)}
//                       placeholder="Description"
//                     />
//                   </label>
//                   <label>
//                     <span>Remark</span>
//                     <input
//                       type="text"
//                       value={job.remark}
//                       onChange={(e) => handleJobField(idx, "remark", e.target.value)}
//                       placeholder="Remark"
//                     />
//                   </label>
//                 </div>
//                 <div className={styles.schematicContainer}>
//                   <div className={styles.schematicTitle}>Dimension Preview - Job {idx + 1}</div>
//                   <SizeSchematic
//                     lHeight={job.lHeight}
//                     rHeight={job.rHeight}
//                     tWidth={job.tWidth}
//                     bWidth={job.bWidth}
//                     jobNum={idx + 1}
//                   />
//                 </div>
//                 <div className={styles.row}>
//                   <label>
//                     <span>Left Height (ft)</span>
//                     <input
//                       type="text"
//                       value={job.lHeight}
//                       onChange={(e) => handleJobField(idx, "lHeight", e.target.value)}
//                       placeholder="Left Height"
//                     />
//                   </label>
//                   <label>
//                     <span>Right Height (ft)</span>
//                     <input
//                       type="text"
//                       value={job.rHeight}
//                       onChange={(e) => handleJobField(idx, "rHeight", e.target.value)}
//                       placeholder="Right Height"
//                     />
//                   </label>
//                 </div>
//                 <div className={styles.row}>
//                   <label>
//                     <span>Top Width (ft)</span>
//                     <input
//                       type="text"
//                       value={job.tWidth}
//                       onChange={(e) => handleJobField(idx, "tWidth", e.target.value)}
//                       placeholder="Top Width"
//                     />
//                   </label>
//                   <label>
//                     <span>Bottom Width (ft)</span>
//                     <input
//                       type="text"
//                       value={job.bWidth}
//                       onChange={(e) => handleJobField(idx, "bWidth", e.target.value)}
//                       placeholder="Bottom Width"
//                     />
//                   </label>
//                 </div>
//                 <div className={styles.row}>
//                   <label>
//                     <span>Images</span>
//                     <input
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => handleJobFileChange(idx, e.target.files)}
//                       disabled={loading}
//                     />
//                   </label>
//                 </div>
//                 <div className={styles.imgPreviewBox}>
//                   {Array.isArray(job.files) &&
//                     job.files.length > 0 &&
//                     job.files.map((file, fileIdx) => {
//                       const previewUrl = createFilePreview(file);
//                       return previewUrl ? (
//                         <div key={fileIdx} className={styles.imgPreview}>
//                           <img
//                             src={previewUrl}
//                             alt={`preview ${fileIdx + 1}`}
//                             width={56}
//                             height={56}
//                             style={{ borderRadius: 8, objectFit: "cover", border: "1.5px solid #e6edf5" }}
//                             onError={(e) => {
//                               console.error("Image failed to load:", file.name);
//                               e.target.style.display = "none";
//                             }}
//                             onLoad={() => URL.revokeObjectURL(previewUrl)}
//                           />
//                           <button
//                             type="button"
//                             className={styles.removeBtn}
//                             onClick={() => handleRemoveJobImage(idx, fileIdx)}
//                             disabled={loading}
//                           >
//                             ×
//                           </button>
//                         </div>
//                       ) : null;
//                     })}
//                 </div>
//                 <div style={{ marginTop: 5 }}>
//                   <button
//                     type="button"
//                     className={styles.removeBtn}
//                     style={{ color: "#d00", fontWeight: 600, fontSize: 16 }}
//                     disabled={form.jobs.length === 1 || loading}
//                     onClick={() => removeJob(idx)}
//                   >
//                     Remove Job
//                   </button>
//                 </div>
//                 <hr style={{ margin: "13px 0 10px 0", border: 0, borderTop: "1.2px solid #e9eefa" }} />
//               </div>
//             ))}
//             <button type="button" onClick={addJob} className={styles.addBtn} style={{ margin: "8px 0 0 0" }} disabled={loading}>
//               + Add Job Item
//             </button>
//           </div>

//           <div className={styles.actions}>
//             <button type="button" onClick={onClose} className={styles.cancel} disabled={loading}>
//               Cancel
//             </button>
//             <button type="submit" className={styles.submit} disabled={loading}>
//               {loading ? "Saving..." : "Save Job Sheet"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import styles from "./JobSheetPopup.module.scss";
import axios from "axios";
import { BASE_URL } from "../api/constants";

// Size schematic preview
function SizeSchematic({ lHeight, rHeight, tWidth, bWidth, jobNum }) {
  const leftHeightText = lHeight ? String(lHeight) : "L";
  const rightHeightText = rHeight ? String(rHeight) : "R";
  const topWidthText = tWidth ? String(tWidth) : "T";
  const bottomWidthText = bWidth ? String(bWidth) : "B";

  return (
    <div className={styles.schematicWrapper}>
      <svg
        viewBox="0 0 200 280"
        className={styles.schematicSvg}
      >
        <rect x="20" y="25" width="160" height="230" rx="6" fill="#fff" stroke="#ccc" strokeWidth="1.5" />
        <line x1="30" y1="65" x2="170" y2="65" stroke="#444" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <line x1="30" y1="215" x2="170" y2="215" stroke="#444" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <line x1="45" y1="45" x2="45" y2="235" stroke="#444" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <line x1="155" y1="45" x2="155" y2="235" stroke="#444" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <rect x="75" y="52" width="50" height="18" rx="4" fill="#fff" stroke="#aaa" />
        <text x="100" y="65" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#222">
          {topWidthText}
        </text>
        <rect x="75" y="202" width="50" height="18" rx="4" fill="#fff" stroke="#aaa" />
        <text x="100" y="215" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#222">
          {bottomWidthText}
        </text>
        <rect x="25" y="131" width="35" height="18" rx="4" fill="#fff" stroke="#aaa" />
        <text x="42.5" y="144" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#222">
          {leftHeightText}
        </text>
        <rect x="140" y="131" width="35" height="18" rx="4" fill="#fff" stroke="#aaa" />
        <text x="157.5" y="144" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#222">
          {rightHeightText}
        </text>
        <text x="100" y="155" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#c5c9d6" opacity="0.6">
          {jobNum ? String(jobNum).padStart(2, "0") : "01"}
        </text>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M0,1.5 L7,4 L0,6.5" fill="#444" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export default function JobSheetPopup({ open, onClose, preSelectedEmployee, onSuccess }) {
  const emptyJob = {
    material: "",
    description: "",
    remark: "",
    lHeight: "",
    rHeight: "",
    tWidth: "",
    bWidth: "",
    files: [],
  };

  const [form, setForm] = useState({
    clientId: "",
    employeeId: preSelectedEmployee?.id || "",
    clientName: "",
    contactPerson: "",
    date: "",
    instructions: "",
    jobs: [{ ...emptyJob }],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        clientId: "",
        employeeId: preSelectedEmployee?.id || "",
        clientName: "",
        contactPerson: "",
        date: "",
        instructions: "",
        jobs: [{ ...emptyJob }],
      });
    }
  }, [open, preSelectedEmployee]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleJobField = (idx, key, value) => {
    setForm((prev) => {
      const updatedJobs = prev.jobs.map((j, i) => (i === idx ? { ...j, [key]: value } : j));
      return { ...prev, jobs: updatedJobs };
    });
  };

  const handleJobFileChange = (idx, files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setForm((prev) => {
      const updatedJobs = prev.jobs.map((j, i) => {
        if (i === idx) {
          const currentFiles = Array.isArray(j.files) ? j.files : [];
          return { ...j, files: [...currentFiles, ...fileArray] };
        }
        return j;
      });
      return { ...prev, jobs: updatedJobs };
    });
  };

  const handleRemoveJobImage = (jobIdx, fileIdx) => {
    setForm((prev) => {
      const updatedJobs = prev.jobs.map((j, i) => {
        if (i === jobIdx) {
          const currentFiles = Array.isArray(j.files) ? j.files : [];
          return { ...j, files: currentFiles.filter((_, k) => k !== fileIdx) };
        }
        return j;
      });
      return { ...prev, jobs: updatedJobs };
    });
  };

  const addJob = () => setForm((prev) => ({ ...prev, jobs: [...prev.jobs, { ...emptyJob }] }));
  const removeJob = (idx) =>
    setForm((prev) => ({
      ...prev,
      jobs: prev.jobs.length === 1 ? prev.jobs : prev.jobs.filter((_, i) => i !== idx),
    }));

  const createFilePreview = (file) => {
    try {
      return URL.createObjectURL(file);
    } catch (error) {
      console.error("Error creating file preview:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.date) {
      alert("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      const jobSheetData = {
        // client: { id: parseInt(form.clientId) },
        employee: { id: parseInt(form.employeeId) },
        clientName: form.clientName || "",
        contactPerson: form.contactPerson || "",
        date: form.date,
        instructions: form.instructions || "",
        jobs: form.jobs.map((job) => ({
          material: job.material || "",
          description: job.description || "",
          remark: job.remark || "",
          lHeight: job.lHeight || "",
          rHeight: job.rHeight || "",
          tWidth: job.tWidth || "",
          bWidth: job.bWidth || "",
          jobSheet: null,
          images: [],
        })),
      };

      const formData = new FormData();
      formData.append("jobSheet", JSON.stringify(jobSheetData));
      form.jobs.forEach((job, jobIndex) => {
        if (Array.isArray(job.files) && job.files.length > 0) {
          job.files.forEach((file) => formData.append(`jobImages[${jobIndex}]`, file));
        }
      });

      const token = sessionStorage.getItem("token");
      const res = await axios.post(`${BASE_URL}/jobsheet/createJobSheet`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.status === 201 || res.status === 201 || res.data?.status === 200 || res.status === 200) {
        alert("Job Sheet created successfully!");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        throw new Error(res.data?.message || "Error creating Job Sheet");
      }
    } catch (err) {
      console.error("Submit error:", err);
      let errorMessage = "Failed to create Job Sheet!";
      if (err?.response?.data?.message) errorMessage = err.response.data.message;
      else if (err?.response?.data)
        errorMessage = typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data);
      else if (err?.message) errorMessage = err.message;
      alert(errorMessage);
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <h2>Create Job Sheet</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>
        
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
          {/* Basic Information */}
          <div className={styles.section}>
            <h3>Basic Information</h3>
            <div className={styles.formGrid}>
              {/* <div className={styles.field}>
                <label>
                  Client ID <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="clientId"
                  value={form.clientId}
                  onChange={handleChange}
                  placeholder="Enter client ID"
                  // required
                />
              </div> */}
              <div className={styles.field}>
                <label>
                  Employee ID <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  placeholder="Enter employee ID"
                  required
                  disabled={!!preSelectedEmployee}
                />
              </div>
              <div className={styles.field}>
                <label>Client Name</label>
                <input
                  type="text"
                  name="clientName"
                  value={form.clientName}
                  onChange={handleChange}
                  placeholder="Client display name"
                />
              </div>
              <div className={styles.field}>
                <label>Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  placeholder="Contact person name"
                />
              </div>
              <div className={styles.field}>
                <label>
                  Date <span className={styles.required}>*</span>
                </label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className={styles.field}>
                <label>Instructions</label>
                <input
                  type="text"
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  placeholder="Special instructions"
                />
              </div>
            </div>
          </div>

          {/* Job Items Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Job Items</h3>
              <button type="button" onClick={addJob} className={styles.addJobBtn} disabled={loading}>
                + Add Job
              </button>
            </div>
            
            <div className={styles.jobsList}>
              {form.jobs.map((job, idx) => (
                <div key={idx} className={styles.jobCard}>
                  <div className={styles.jobHeader}>
                    <h4>Job {idx + 1}</h4>
                    {form.jobs.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeJobBtn}
                        disabled={loading}
                        onClick={() => removeJob(idx)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className={styles.jobContent}>
                    {/* Job Details */}
                    <div className={styles.jobGrid}>
                      <div className={styles.field}>
                        <label>Material</label>
                        <input
                          type="text"
                          value={job.material}
                          onChange={(e) => handleJobField(idx, "material", e.target.value)}
                          placeholder="Material type"
                        />
                      </div>
                      <div className={styles.field}>
                        <label>Description</label>
                        <input
                          type="text"
                          value={job.description}
                          onChange={(e) => handleJobField(idx, "description", e.target.value)}
                          placeholder="Job description"
                        />
                      </div>
                      <div className={styles.field}>
                        <label>Remark</label>
                        <input
                          type="text"
                          value={job.remark}
                          onChange={(e) => handleJobField(idx, "remark", e.target.value)}
                          placeholder="Additional notes"
                        />
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div className={styles.dimensionsSection}>
                      <h5>Dimensions (ft)</h5>
                      <div className={styles.dimensionsGrid}>
                        <div className={styles.field}>
                          <label>Left Height</label>
                          <input
                            type="text"
                            value={job.lHeight}
                            onChange={(e) => handleJobField(idx, "lHeight", e.target.value)}
                            placeholder="0.0"
                          />
                        </div>
                        <div className={styles.field}>
                          <label>Right Height</label>
                          <input
                            type="text"
                            value={job.rHeight}
                            onChange={(e) => handleJobField(idx, "rHeight", e.target.value)}
                            placeholder="0.0"
                          />
                        </div>
                        <div className={styles.field}>
                          <label>Top Width</label>
                          <input
                            type="text"
                            value={job.tWidth}
                            onChange={(e) => handleJobField(idx, "tWidth", e.target.value)}
                            placeholder="0.0"
                          />
                        </div>
                        <div className={styles.field}>
                          <label>Bottom Width</label>
                          <input
                            type="text"
                            value={job.bWidth}
                            onChange={(e) => handleJobField(idx, "bWidth", e.target.value)}
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                      
                      {/* Schematic Preview */}
                      <div className={styles.schematicContainer}>
                        <SizeSchematic
                          lHeight={job.lHeight}
                          rHeight={job.rHeight}
                          tWidth={job.tWidth}
                          bWidth={job.bWidth}
                          jobNum={idx + 1}
                        />
                      </div>
                    </div>

                    {/* Images */}
                    <div className={styles.imagesSection}>
                      <label>Images</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleJobFileChange(idx, e.target.files)}
                        disabled={loading}
                        className={styles.fileInput}
                      />
                      <div className={styles.imgPreviewBox}>
                        {Array.isArray(job.files) &&
                          job.files.length > 0 &&
                          job.files.map((file, fileIdx) => {
                            const previewUrl = createFilePreview(file);
                            return previewUrl ? (
                              <div key={fileIdx} className={styles.imgPreview}>
                                <img
                                  src={previewUrl}
                                  alt={`preview ${fileIdx + 1}`}
                                  onError={(e) => {
                                    console.error("Image failed to load:", file.name);
                                    e.target.style.display = "none";
                                  }}
                                  onLoad={() => URL.revokeObjectURL(previewUrl)}
                                />
                                <button
                                  type="button"
                                  className={styles.removeImgBtn}
                                  onClick={() => handleRemoveJobImage(idx, fileIdx)}
                                  disabled={loading}
                                >
                                  ×
                                </button>
                              </div>
                            ) : null;
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Creating..." : "Create Job Sheet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}