import React, { useState } from "react";
import styles from "./JobSheetPreview.module.scss";
import logo from "../assets/logo.png";
import { X } from "lucide-react";

const formatDate = (str) =>
  str
    ? new Date(str).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "--";

// Updated SizeSchematic with proper directional arrows and correct fields
function SizeSchematic({ lHeight, rHeight, tWidth, bWidth, jobNum }) {
  const leftHeightText = lHeight ? String(lHeight) : "L";
  const rightHeightText = rHeight ? String(rHeight) : "R";
  const topWidthText = tWidth ? String(tWidth) : "T";
  const bottomWidthText = bWidth ? String(bWidth) : "B";

  return (
    <div className={styles.schematicWrapper}>
      <svg
        viewBox="0 0 220 350"
        className={styles.schematicSvg}
      >
        {/* Sheet rectangle */}
        <rect
          x="30"
          y="40"
          width="160"
          height="270"
          rx="8"
          fill="#fff"
          stroke="#ccc"
          strokeWidth="2"
        />

        {/* TOP WIDTH - Arrow pointing up */}
        <line
          x1="110"
          y1="20"
          x2="110"
          y2="40"
          stroke="#444"
          strokeWidth="2"
          markerEnd="url(#arrowDown)"
        />
        <text
          x="110"
          y="16"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#222"
        >
          {topWidthText}
        </text>

        {/* BOTTOM WIDTH - Arrow pointing down */}
        <line
          x1="110"
          y1="310"
          x2="110"
          y2="330"
          stroke="#444"
          strokeWidth="2"
          markerEnd="url(#arrowDown)"
        />
        <text
          x="110"
          y="345"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#222"
        >
          {bottomWidthText}
        </text>

        {/* LEFT HEIGHT - Arrow pointing left */}
        <line
          x1="10"
          y1="175"
          x2="30"
          y2="175"
          stroke="#444"
          strokeWidth="2"
          markerEnd="url(#arrowRight)"
        />
        <text
          x="6"
          y="180"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#222"
        >
          {leftHeightText}
        </text>

        {/* RIGHT HEIGHT - Arrow pointing right */}
        <line
          x1="190"
          y1="175"
          x2="210"
          y2="175"
          stroke="#444"
          strokeWidth="2"
          markerEnd="url(#arrowRight)"
        />
        <text
          x="214"
          y="180"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#222"
        >
          {rightHeightText}
        </text>

        {/* Job number in center */}
        <text
          x="110"
          y="185"
          textAnchor="middle"
          fontSize="42"
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

export default function JobSheetPreview({ open, jobSheet, onClose }) {
  const [previewImg, setPreviewImg] = useState(null);

  if (!open || !jobSheet) return null;

  const {
    client,
    contactPerson,
    srNumber,
    date,
    jobs,
    instructions,
  } = jobSheet;

  // Ensure jobs is always an array
  const safeJobs = Array.isArray(jobs) ? jobs : [];

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.previewBox}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close preview">
          <X size={20} />
        </button>
        
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.sheetTitle}>JOB SHEET</div>
          <img src={logo} alt="Company Logo" className={styles.logo} />
        </div>
        
        {/* TOP INFO */}
        <div className={styles.infoGrid}>
          <div>
            <div>
              <b>CLIENT NAME :</b> 
              <span>{client?.name || jobSheet.clientName || "--"}</span>
            </div>
            <div>
              <b>CONTACT PERSON :</b> 
              <span>{contactPerson || "--"}</span>
            </div>
          </div>
          <div>
            <div>
              <b>DATE :</b> 
              <span>{formatDate(date)}</span>
            </div>
            <div>
              <b>SR NO :</b> 
              <span>{srNumber || "--"}</span>
            </div>
          </div>
        </div>
        
        {/* JOBS */}
        <div className={styles.jobsArea}>
          {safeJobs.length === 0 && (
            <div className={styles.noJobs}>No jobs found.</div>
          )}
          {safeJobs.map((job, idx) => (
            <div className={styles.jobRow} key={idx}>
              {/* LEFT - schematic/size/material */}
              <div className={styles.leftCol}>
                <SizeSchematic
                  lHeight={job.lHeight}
                  rHeight={job.rHeight}
                  tWidth={job.tWidth}
                  bWidth={job.bWidth}
                  jobNum={idx + 1}
                />
                <div className={styles.matRow}>
                  <span>
                    <b>Material:</b> {job.material || "--"}
                  </span>
                </div>
              </div>
              
              {/* RIGHT - image, desc, remark */}
              <div className={styles.rightCol}>
                <div className={styles.imgBox}>
                  {job.images && Array.isArray(job.images) && job.images.length > 0 ? (
                    job.images.map((img, i) => (
                      <div key={i} className={styles.imageWrapper}>
                        <img
                          src={img.base64 || img}
                          alt={`Job Image ${i + 1}`}
                          className={styles.jobImg}
                          onClick={() => setPreviewImg(img.base64 || img)}
                          onError={(e) => {
                            e.target.src = logo; // Fallback to logo
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <div className={styles.noImg}>No Image</div>
                  )}
                </div>
                
                <div className={styles.descRow}>
                  <b>Description:</b> {job.description || "--"}
                </div>
                
                {job.remark && (
                  <div className={styles.remarkRow}>
                    <b>Remark:</b> {job.remark}
                  </div>
                )}
                
                {/* Dimensions Display */}
                <div className={styles.dimensionsRow}>
                  <div className={styles.dimItem}>
                    <span className={styles.dimLabel}>L:</span>
                    <span className={styles.dimValue}>{job.lHeight || "--"} ft</span>
                  </div>
                  <div className={styles.dimItem}>
                    <span className={styles.dimLabel}>R:</span>
                    <span className={styles.dimValue}>{job.rHeight || "--"} ft</span>
                  </div>
                  <div className={styles.dimItem}>
                    <span className={styles.dimLabel}>T:</span>
                    <span className={styles.dimValue}>{job.tWidth || "--"} ft</span>
                  </div>
                  <div className={styles.dimItem}>
                    <span className={styles.dimLabel}>B:</span>
                    <span className={styles.dimValue}>{job.bWidth || "--"} ft</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* SHEET INSTRUCTIONS */}
        {instructions && (
          <div className={styles.remarksSection}>
            <b>Instructions:</b>
            <div>{instructions}</div>
          </div>
        )}

        {/* IMAGE PREVIEW MODAL */}
        {previewImg && (
          <div
            className={styles.imagePreviewBackdrop}
            onClick={() => setPreviewImg(null)}
          >
            <div className={styles.imagePreviewContainer}>
              <button
                className={styles.imageCloseBtn}
                onClick={() => setPreviewImg(null)}
                aria-label="Close image"
              >
                <X size={18} />
              </button>
              <img
                src={previewImg}
                alt="Job Full Size"
                className={styles.imagePreviewBig}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}