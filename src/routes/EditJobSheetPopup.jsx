import React, { useState, useEffect } from "react";
import styles from "./JobSheetDetailPopup.module.scss";
import logo from "../assets/logo.png";

const formatDate = (str) =>
  str
    ? new Date(str).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toISOString().split("T")[0];
};

// Updated SizeSchematic with proper directional arrows
function SizeSchematic({ lHeight, rHeight, tWidth, bWidth, jobNum }) {
  const leftHeightText = lHeight ? String(lHeight) : "L";
  const rightHeightText = rHeight ? String(rHeight) : "R";
  const topWidthText = tWidth ? String(tWidth) : "T";
  const bottomWidthText = bWidth ? String(bWidth) : "B";

  return (
    <div
      style={{
        width: "200px",
        height: "280px",
        maxWidth: "100%",
        margin: "10px auto",
      }}
    >
      <svg
        viewBox="0 0 200 280"
        width="100%"
        height="100%"
        style={{
          display: "block",
          background: "#f8f9fa",
          borderRadius: 12,
          border: "1px solid #e5ebf7",
        }}
      >
        {/* Sheet rectangle */}
        <rect
          x="30"
          y="40"
          width="140"
          height="200"
          rx="6"
          fill="#fff"
          stroke="#ccc"
          strokeWidth="1.5"
        />

        {/* TOP WIDTH - Arrow pointing up */}
        <line
          x1="100"
          y1="25"
          x2="100"
          y2="40"
          stroke="#444"
          strokeWidth="1.5"
          markerEnd="url(#arrowDown)"
        />
        <text
          x="100"
          y="20"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="#222"
        >
          {topWidthText}
        </text>

        {/* BOTTOM WIDTH - Arrow pointing down */}
        <line
          x1="100"
          y1="240"
          x2="100"
          y2="255"
          stroke="#444"
          strokeWidth="1.5"
          markerEnd="url(#arrowDown)"
        />
        <text
          x="100"
          y="270"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="#222"
        >
          {bottomWidthText}
        </text>

        {/* LEFT HEIGHT - Arrow pointing left */}
        <line
          x1="15"
          y1="140"
          x2="30"
          y2="140"
          stroke="#444"
          strokeWidth="1.5"
          markerEnd="url(#arrowRight)"
        />
        <text
          x="10"
          y="145"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="#222"
        >
          {leftHeightText}
        </text>

        {/* RIGHT HEIGHT - Arrow pointing right */}
        <line
          x1="170"
          y1="140"
          x2="185"
          y2="140"
          stroke="#444"
          strokeWidth="1.5"
          markerEnd="url(#arrowRight)"
        />
        <text
          x="190"
          y="145"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="#222"
        >
          {rightHeightText}
        </text>

        {/* Job number in center */}
        <text
          x="100"
          y="150"
          textAnchor="middle"
          fontSize="32"
          fontWeight="bold"
          fill="#c5c9d6"
          opacity="0.6"
        >
          {jobNum ? String(jobNum).padStart(2, "0") : "01"}
        </text>

        {/* Arrow marker definitions */}
        <defs>
          {/* Arrow pointing right */}
          <marker
            id="arrowRight"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="0"
            markerUnits="strokeWidth"
          >
            <path d="M0,1.5 L7,4 L0,6.5" fill="#444" />
          </marker>

          {/* Arrow pointing down */}
          <marker
            id="arrowDown"
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="7"
            orient="90"
            markerUnits="strokeWidth"
          >
            <path d="M1.5,0 L4,7 L6.5,0" fill="#444" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export default function EditJobSheetPopup({
  open,
  onClose,
  job,
  clients = [],
  employees = [],
  onSave,
}) {
  const [formData, setFormData] = useState({
    srNumber: "",
    client: { id: null, name: "", address: "" },
    clientName: "",
    contactPerson: "",
    date: "",
    instructions: "",
    employee: { id: null, firstName: "", lastName: "" },
    jobs: [],
  });

  const [newImages, setNewImages] = useState({}); // jobIndex -> File[]
  const [deletedImages, setDeletedImages] = useState({}); // jobIndex -> imageIds[]
  const [previewImg, setPreviewImg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize form data when job prop changes
  useEffect(() => {
    if (job) {
      setFormData({
        srNumber: job.srNumber || "",
        client: job.client || { id: null, name: "", address: "" },
        clientName: job.clientName || "",
        contactPerson: job.contactPerson || "",
        date: formatDateForInput(job.date) || "",
        instructions: job.instructions || "",
        employee: job.employee || { id: null, firstName: "", lastName: "" },
        jobs:
          job.jobs?.map((jobItem) => ({
            id: jobItem.id || null,
            material: jobItem.material || "",
            description: jobItem.description || "",
            remark: jobItem.remark || "",
            lHeight: jobItem.lHeight || "",
            rHeight: jobItem.rHeight || "",
            tWidth: jobItem.tWidth || "",
            bWidth: jobItem.bWidth || "",
            images: jobItem.images || [],
          })) || [],
      });
      setNewImages({});
      setDeletedImages({});
    }
  }, [job]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find((c) => c.id === parseInt(clientId));
    setFormData((prev) => ({
      ...prev,
      client: selectedClient || { id: null, name: "", address: "" },
      clientName: selectedClient?.name || "",
    }));
  };

  const handleEmployeeChange = (employeeId) => {
    const selectedEmployee = employees.find(
      (e) => e.id === parseInt(employeeId)
    );
    setFormData((prev) => ({
      ...prev,
      employee: selectedEmployee || { id: null, firstName: "", lastName: "" },
    }));
  };

  const handleJobChange = (jobIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      jobs: prev.jobs.map((job, idx) =>
        idx === jobIndex ? { ...job, [field]: value } : job
      ),
    }));
  };

  const addJob = () => {
    setFormData((prev) => ({
      ...prev,
      jobs: [
        ...prev.jobs,
        {
          id: null,
          material: "",
          description: "",
          remark: "",
          lHeight: "",
          rHeight: "",
          tWidth: "",
          bWidth: "",
          images: [],
        },
      ],
    }));
  };

  const removeJob = (jobIndex) => {
    setFormData((prev) => ({
      ...prev,
      jobs: prev.jobs.filter((_, idx) => idx !== jobIndex),
    }));

    // Clean up associated images
    const newImagesUpdated = { ...newImages };
    delete newImagesUpdated[jobIndex];
    setNewImages(newImagesUpdated);

    const deletedImagesUpdated = { ...deletedImages };
    delete deletedImagesUpdated[jobIndex];
    setDeletedImages(deletedImagesUpdated);
  };

  const handleImageUpload = (jobIndex, files) => {
    setNewImages((prev) => ({
      ...prev,
      [jobIndex]: [...(prev[jobIndex] || []), ...Array.from(files)],
    }));
  };

  const removeNewImage = (jobIndex, imageIndex) => {
    setNewImages((prev) => ({
      ...prev,
      [jobIndex]: prev[jobIndex]?.filter((_, idx) => idx !== imageIndex) || [],
    }));
  };

  const removeExistingImage = (jobIndex, imageId) => {
    // Remove from job's images array
    setFormData((prev) => ({
      ...prev,
      jobs: prev.jobs.map((job, idx) =>
        idx === jobIndex
          ? { ...job, images: job.images.filter((img) => img.id !== imageId) }
          : job
      ),
    }));

    // Track for deletion
    setDeletedImages((prev) => ({
      ...prev,
      [jobIndex]: [...(prev[jobIndex] || []), imageId],
    }));
  };

//   const handleSave = async () => {
//     setLoading(true);
//     try {
//       const formDataToSend = new FormData();

//       // Prepare job sheet data (excluding images)
//       const jobSheetData = {
//         srNumber: formData.srNumber,
//         client: { id: formData.client.id },
//         clientName: formData.clientName,
//         contactPerson: formData.contactPerson,
//         date: formData.date ? new Date(formData.date).toISOString() : null,
//         instructions: formData.instructions,
//         employee: { id: formData.employee.id },
//         jobs: formData.jobs.map((job) => ({
//           id: job.id,
//           material: job.material,
//           description: job.description,
//           remark: job.remark,
//           lHeight: job.lHeight ? parseFloat(job.lHeight) : null,
//           rHeight: job.rHeight ? parseFloat(job.rHeight) : null,
//           tWidth: job.tWidth ? parseFloat(job.tWidth) : null,
//           bWidth: job.bWidth ? parseFloat(job.bWidth) : null,
//         })),
//       };

//       formDataToSend.append("jobSheet", JSON.stringify(jobSheetData));

//       // Add new images with proper naming convention
//       Object.entries(newImages).forEach(([jobIndex, files]) => {
//         files.forEach((file, fileIndex) => {
//           formDataToSend.append(`jobImages[${jobIndex}]`, file);
//         });
//       });

//       //   const response = await fetch(`http://localhost:8080/api/jobsheets/updatejobsheet/${job.srNumber}`, {
//       //     method: 'PUT',
//       //     body: formDataToSend,
//       //   });

//       // Replace the existing API call section in handleSave with this:

//       const response = await fetch(
//         `${BASE_URL}/jobsheets/updatejobsheet/${job.srNumber}`,
//         {
//           method: "PUT",
//           body: formDataToSend,
//         }
//       );

//       if (response.ok) {
//         const result = await response.json();
//         if (onSave) {
//           onSave(result.data);
//         }
//         onClose();
//       } else {
//         const error = await response.json();
//         alert(`Error: ${error.message || "Failed to update job sheet"}`);
//       }
//     } catch (error) {
//       console.error("Error updating job sheet:", error);
//       alert("Error updating job sheet. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

// Replace the handleSave function's API call section with this:
// const BASE_URL ="http://localhost:8080/api"
const BASE_URL ="https://api.alankardigitalhub.in/api"

// Replace the handleSave function's API call section with this:

const handleSave = async () => {
  setLoading(true);
  try {
    const formDataToSend = new FormData();

    // Prepare job sheet data (excluding images)
    const jobSheetData = {
      srNumber: formData.srNumber,
      client: { id: formData.client.id },
      clientName: formData.clientName,
      contactPerson: formData.contactPerson,
      date: formData.date ? new Date(formData.date).toISOString() : null,
      instructions: formData.instructions,
      employee: { id: formData.employee.id },
      jobs: formData.jobs.map((job) => ({
        id: job.id,
        material: job.material,
        description: job.description,
        remark: job.remark,
        lHeight: job.lHeight ? parseFloat(job.lHeight) : null,
        rHeight: job.rHeight ? parseFloat(job.rHeight) : null,
        tWidth: job.tWidth ? parseFloat(job.tWidth) : null,
        bWidth: job.bWidth ? parseFloat(job.bWidth) : null,
      })),
    };

    formDataToSend.append("jobSheet", JSON.stringify(jobSheetData));

    // Add deleted images info
    Object.entries(deletedImages).forEach(([jobIndex, imageIds]) => {
      imageIds.forEach(imageId => {
        formDataToSend.append(`deletedImages[${jobIndex}]`, imageId);
      });
    });

    // Add new images with proper naming convention
    Object.entries(newImages).forEach(([jobIndex, files]) => {
      files.forEach((file, fileIndex) => {
        formDataToSend.append(`jobImages[${jobIndex}]`, file);
      });
    });

    // Get token (adjust this based on where you store the token)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // Fixed API call using fetch with BASE_URL string and Authorization
    const response = await fetch(
      `${BASE_URL}/jobsheet/updatejobsheet/${job.srNumber}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      }
    );

    // Handle fetch response
    if (response.ok) {
      const result = await response.json();
      if (onSave) {
        onSave(result.data || result);
      }
      onClose();
    } else {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      alert(`Error: ${error.message || 'Failed to update job sheet'}`);
    }
  } catch (error) {
    console.error("Error updating job sheet:", error);
    alert(`Error updating job sheet: ${error.response?.data?.message || error.message || 'Please try again.'}`);
  } finally {
    setLoading(false);
  }
};
  if (!open || !job) return null;

  return (
    <div className={styles.overlay}>
      <div
        className={styles.popup}
        style={{ maxWidth: "800px", width: "95vw" }}
      >
        <div className={styles.header}>
          <span className={styles.sr}>
            Edit Jobsheet{" "}
            {formData.srNumber
              ? formData.srNumber.toString().padStart(2, "0")
              : "--"}
          </span>
          <span className={styles.close} onClick={onClose}>
            ×
          </span>
        </div>

        <div
          style={{ maxHeight: "80vh", overflowY: "auto", padding: "0 26px" }}
        >
          {/* Basic Information */}
          <div className={styles.row}>
            <div>
              <div className={styles.label}>Client</div>
              <select
                className={styles.inputLike}
                value={formData.client.id || ""}
                onChange={(e) => handleClientChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e5ebf7",
                  borderRadius: "6px",
                }}
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className={styles.label}>Contact Person</div>
              <input
                type="text"
                className={styles.inputLike}
                value={formData.contactPerson}
                onChange={(e) =>
                  handleInputChange("contactPerson", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e5ebf7",
                  borderRadius: "6px",
                }}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <div className={styles.label}>Date</div>
              <input
                type="date"
                className={styles.inputLike}
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e5ebf7",
                  borderRadius: "6px",
                }}
              />
            </div>
            <div>
              <div className={styles.label}>Assigned Employee</div>
              <select
                className={styles.inputLike}
                value={formData.employee.id || ""}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e5ebf7",
                  borderRadius: "6px",
                }}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Jobs Section */}
          <div className={styles.jobsPreview}>
            <div
              className={styles.jobsTitle}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Job Items ({formData.jobs.length})</span>
              <button
                onClick={addJob}
                style={{
                  background:
                    "linear-gradient(90deg, #2196f3 0%, #70e2b4 100%)",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                + Add Job
              </button>
            </div>

            {formData.jobs.map((jobItem, idx) => (
              <div key={idx} className={styles.jobItemCard}>
                <div
                  className={styles.jobHeader}
                  style={{
                    background:
                      "linear-gradient(90deg, #1977d7 0%, #70e2b4 100%)",
                  }}
                >
                  <span className={styles.jobNum}>Job {idx + 1}</span>
                  {formData.jobs.length > 1 && (
                    <button
                      onClick={() => removeJob(idx)}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        border: "none",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className={styles.jobContent}>
                  <div className={styles.schematicCol}>
                    <SizeSchematic
                      lHeight={jobItem.lHeight}
                      rHeight={jobItem.rHeight}
                      tWidth={jobItem.tWidth}
                      bWidth={jobItem.bWidth}
                      jobNum={idx + 1}
                    />
                  </div>

                  <div className={styles.detailsCol}>
                    {/* Material */}
                    <div className={styles.jobDetail}>
                      <span className={styles.detailLabel}>Material:</span>
                      <input
                        type="text"
                        className={styles.detailValue}
                        value={jobItem.material}
                        onChange={(e) =>
                          handleJobChange(idx, "material", e.target.value)
                        }
                        style={{ border: "1px solid #e5ebf7" }}
                      />
                    </div>

                    {/* Description */}
                    <div className={styles.jobDetail}>
                      <span className={styles.detailLabel}>Description:</span>
                      <textarea
                        className={styles.detailValue}
                        value={jobItem.description}
                        onChange={(e) =>
                          handleJobChange(idx, "description", e.target.value)
                        }
                        rows={3}
                        style={{
                          border: "1px solid #e5ebf7",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    {/* Remark */}
                    <div className={styles.jobDetail}>
                      <span className={styles.detailLabel}>Remark:</span>
                      <textarea
                        className={styles.detailValue}
                        value={jobItem.remark}
                        onChange={(e) =>
                          handleJobChange(idx, "remark", e.target.value)
                        }
                        rows={2}
                        style={{
                          border: "1px solid #e5ebf7",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    {/* Dimensions */}
                    <div className={styles.dimensionsGrid}>
                      <div className={styles.dimItem}>
                        <span className={styles.dimLabel}>Left Height:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={jobItem.lHeight}
                          onChange={(e) =>
                            handleJobChange(idx, "lHeight", e.target.value)
                          }
                          style={{
                            border: "1px solid #e5ebf7",
                            padding: "4px",
                            borderRadius: "4px",
                            width: "60px",
                          }}
                        />
                        <span style={{ fontSize: "12px", color: "#7d8faa" }}>
                          ft
                        </span>
                      </div>
                      <div className={styles.dimItem}>
                        <span className={styles.dimLabel}>Right Height:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={jobItem.rHeight}
                          onChange={(e) =>
                            handleJobChange(idx, "rHeight", e.target.value)
                          }
                          style={{
                            border: "1px solid #e5ebf7",
                            padding: "4px",
                            borderRadius: "4px",
                            width: "60px",
                          }}
                        />
                        <span style={{ fontSize: "12px", color: "#7d8faa" }}>
                          ft
                        </span>
                      </div>
                      <div className={styles.dimItem}>
                        <span className={styles.dimLabel}>Top Width:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={jobItem.tWidth}
                          onChange={(e) =>
                            handleJobChange(idx, "tWidth", e.target.value)
                          }
                          style={{
                            border: "1px solid #e5ebf7",
                            padding: "4px",
                            borderRadius: "4px",
                            width: "60px",
                          }}
                        />
                        <span style={{ fontSize: "12px", color: "#7d8faa" }}>
                          ft
                        </span>
                      </div>
                      <div className={styles.dimItem}>
                        <span className={styles.dimLabel}>Bottom Width:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={jobItem.bWidth}
                          onChange={(e) =>
                            handleJobChange(idx, "bWidth", e.target.value)
                          }
                          style={{
                            border: "1px solid #e5ebf7",
                            padding: "4px",
                            borderRadius: "4px",
                            width: "60px",
                          }}
                        />
                        <span style={{ fontSize: "12px", color: "#7d8faa" }}>
                          ft
                        </span>
                      </div>
                    </div>

                    {/* Images Section */}
                    <div className={styles.imagesSection}>
                      <div className={styles.detailLabel}>Images:</div>

                      {/* Existing Images */}
                      {jobItem.images && jobItem.images.length > 0 && (
                        <div className={styles.imagesList}>
                          {jobItem.images.map((img, i) => (
                            <div key={i} style={{ position: "relative" }}>
                              <img
                                src={img.imageUrl || img.base64 || img}
                                alt={`Job Image ${i + 1}`}
                                className={styles.jobThumb}
                                onClick={() =>
                                  setPreviewImg(
                                    img.imageUrl || img.base64 || img
                                  )
                                }
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                              <button
                                onClick={() => removeExistingImage(idx, img.id)}
                                style={{
                                  position: "absolute",
                                  top: "-8px",
                                  right: "-8px",
                                  background: "#ff4757",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "20px",
                                  height: "20px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* New Images Preview */}
                      {newImages[idx] && newImages[idx].length > 0 && (
                        <div
                          className={styles.imagesList}
                          style={{ marginTop: "8px" }}
                        >
                          {newImages[idx].map((file, i) => (
                            <div
                              key={`new-${i}`}
                              style={{ position: "relative" }}
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`New Image ${i + 1}`}
                                className={styles.jobThumb}
                                onClick={() =>
                                  setPreviewImg(URL.createObjectURL(file))
                                }
                              />
                              <button
                                onClick={() => removeNewImage(idx, i)}
                                style={{
                                  position: "absolute",
                                  top: "-8px",
                                  right: "-8px",
                                  background: "#ff4757",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "20px",
                                  height: "20px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Image Upload */}
                      <div style={{ marginTop: "8px" }}>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(idx, e.target.files)
                          }
                          style={{ display: "none" }}
                          id={`image-upload-${idx}`}
                        />
                        <label
                          htmlFor={`image-upload-${idx}`}
                          style={{
                            display: "inline-block",
                            background: "#f1f4fa",
                            border: "2px dashed #b9cde5",
                            borderRadius: "6px",
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: "#7d8faa",
                            transition: "all 0.2s",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = "#e5ebf7";
                            e.target.style.borderColor = "#1977d7";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = "#f1f4fa";
                            e.target.style.borderColor = "#b9cde5";
                          }}
                        >
                          + Add Images
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className={styles.box}>
            <div>
              <div className={styles.label}>Instructions</div>
              <textarea
                className={styles.inputLike}
                value={formData.instructions}
                onChange={(e) =>
                  handleInputChange("instructions", e.target.value)
                }
                rows={4}
                style={{
                  width: "100%",
                  resize: "vertical",
                  border: "1px solid #e5ebf7",
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.buttonRow}>
          <button
            className={styles.backBtn}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={styles.previewBtn}
            onClick={handleSave}
            disabled={loading}
            style={{
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImg && (
        <div
          className={styles.imagePreviewBackdrop}
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            alt="Job Image Full Size"
            className={styles.imagePreviewBig}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className={styles.closeBtn}
            style={{ position: "absolute", top: 30, right: 10, zIndex: 1001 }}
            onClick={() => setPreviewImg(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
