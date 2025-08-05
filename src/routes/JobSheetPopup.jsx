// src/components/JobSheetPopup.jsx
import React, { useState, useEffect } from "react";
import styles from "./JobSheetPopup.module.scss";
import { useData } from "../context/dataContext";
import axios from "axios";
import { BASE_URL } from "../api/constants";

export default function JobSheetPopup({
  open,
  onClose,
  preSelectedEmployee,
  onSuccess,
}) {
  
   const [error, setError] = useState("");
   const [employee, setEmployee] = useState(null);
  useEffect(() => {
    async function fetchEmployeeData() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/employees/getemployeedata");
        setEmployee(res.data.data);
     
        console.log(res.data);
      } catch (err) {
        setError("Failed to load employee data");
      } finally {
        setLoading(false);
      }
   
    }
    fetchEmployeeData();

  }, []);

    
  const [form, setForm] = useState({
    // clientName: "",
    employeeName: "",
    contactPerson: "",
    date: "",
    description: "",
    materials: [""],
    images: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        // clientName: "",
        employeeName: preSelectedEmployee?.name || "",
        contactPerson: "",
        date: "",
        description: "",
        materials: [""],
        images: [],
      });
    }
  }, [open, preSelectedEmployee]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleArrayChange = (field, idx, value) => {
    setForm((prev) => {
      const arr = [...prev[field]];
      arr[idx] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayField = (field) =>
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ""] }));

  const removeArrayField = (field, idx) =>
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== idx),
    }));

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const base64Promises = files.map(fileToBase64);
    const base64Images = await Promise.all(base64Promises);
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...base64Images],
    }));
  };

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  const handleRemoveImage = (idx) =>
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clientName || !form.employeeName || !form.date) {
      alert("Please fill all required fields.");
      return;
    }

    // ✅ Payload with names only
    const jobSheetPayload = {
      client: { name: form.clientName },
      employee: { name: form.employeeName },
      contactPerson: form.contactPerson,
      date: form.date,
      description: form.description,
      materials: form.materials.filter(Boolean).map((name) => ({ name })),
      images: form.images,
    };

    setLoading(true);
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        `${BASE_URL}/jobsheet/createJobSheet`,
        jobSheetPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data?.status === 200 || res.status === 200) {
        alert("Job Sheet created successfully!");
        setLoading(false);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        throw new Error(res.data?.message || "Error creating Job Sheet");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create Job Sheet!");
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <h2>Add Job Sheet</h2>
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
          {/* Client Name */}
          <div className={styles.field}>
            <label>
              Client <span>*</span>
            </label>
            <input
              type="text"
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              placeholder="Enter client name"
              required
            />
          </div>

          {/* Employee Name */}
          <div className={styles.field}>
            <label>
              Employee <span>*</span>
            </label>
            <input
              type="text"
              name="employeeName"
              value={form.employeeName}
              onChange={handleChange}
              placeholder="Enter employee name"
              required
            />
          </div>

          {/* Contact Person */}
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

          {/* Date */}
          <div className={styles.field}>
            <label>
              Date <span>*</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Add job description"
            />
          </div>

          {/* Materials */}
          <div className={styles.arrayField}>
            <label>Materials</label>
            {form.materials.map((mat, idx) => (
              <div key={idx} className={styles.arrayRow}>
                <input
                  type="text"
                  value={mat}
                  onChange={(e) =>
                    handleArrayChange("materials", idx, e.target.value)
                  }
                  placeholder="Material"
                />
                {form.materials.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeArrayField("materials", idx)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField("materials")}
              className={styles.addBtn}
            >
              + Add Material
            </button>
          </div>

          {/* Images */}
          <div className={styles.field}>
            <label>Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            <div className={styles.imgPreviewBox}>
              {form.images.map((img, idx) => (
                <div key={idx} className={styles.imgPreview}>
                  <img
                    src={img}
                    alt={`preview ${idx + 1}`}
                    width={56}
                    height={56}
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => handleRemoveImage(idx)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancel}>
              Cancel
            </button>
            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? "Saving..." : "Save Job Sheet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
