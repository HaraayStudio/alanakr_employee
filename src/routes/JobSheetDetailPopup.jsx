import React, { useState } from "react";
import styles from "./JobSheetDetailPopup.module.scss";
import logo from "../assets/logo.png";
import jb from "../assets/jb.png";

const formatDate = (str) =>
  str
    ? new Date(str).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

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
        style={{ display: "block", background: "#f8f9fa", borderRadius: 12, border: "1px solid #e5ebf7" }}
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

function JobSheetPreview({ open, jobSheet, onClose }) {
  const [previewImg, setPreviewImg] = useState(null);

  if (!open || !jobSheet) return null;

  const { client, contactPerson, srNumber, date, instructions } = jobSheet;
  const jobs = Array.isArray(jobSheet.jobs) ? jobSheet.jobs : [];

  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.previewBox}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        <div className={styles.header}>
          <div className={styles.sheetTitle}>JOB SHEET</div>
          <img src={logo} alt="Logo" className={styles.logo} />
        </div>
        <div className={styles.infoGrid}>
          <div>
            <div><b>CLIENT NAME :</b> <span>{client?.name || jobSheet.clientName || "--"}</span></div>
            <div><b>CONTACT PERSON :</b> <span>{contactPerson || "--"}</span></div>
          </div>
          <div>
            <div><b>DATE :</b> <span>{formatDate(date)}</span></div>
            <div><b>SR NO :</b> <span>{srNumber || "--"}</span></div>
          </div>
        </div>
        <div className={styles.jobsArea}>
          {jobs.length === 0 && (
            <div style={{ color: "#777", padding: "2rem", textAlign: "center" }}>No jobs found.</div>
          )}
          {jobs.map((job, idx) => (
            <div className={styles.jobRow} key={idx}>
              <div className={styles.leftCol}>
                <SizeSchematic 
                  lHeight={job.lHeight} 
                  rHeight={job.rHeight} 
                  tWidth={job.tWidth} 
                  bWidth={job.bWidth} 
                  jobNum={idx + 1} 
                />
                <div className={styles.matRow}>
                  <span><b>Material:</b> {job.material || "--"}</span>
                </div>
              </div>
              <div className={styles.rightCol}>
                <div className={styles.imgBox}>
                  {job.images && Array.isArray(job.images) && job.images.length > 0 ? (
                    job.images.map((img, i) => (
                      <img
                        key={i}
                        src={img.base64 || img}
                        alt={`Job Image ${i + 1}`}
                        className={styles.jobImg}
                        onClick={() => setPreviewImg(img.base64 || img)}
                        style={{ cursor: "pointer" }}
                        onError={(e) => {
                          e.target.src = logo; // Fallback to logo if image fails
                        }}
                      />
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
        {instructions && (
          <div className={styles.remarksSection}>
            <b>Instructions:</b>
            <div>{instructions}</div>
          </div>
        )}
        
        {previewImg && (
          <div
            className={styles.imagePreviewBackdrop}
            onClick={() => setPreviewImg(null)}
          >
            <img
              src={previewImg}
              alt="Job Full Size"
              className={styles.imagePreviewBig}
              onClick={e => e.stopPropagation()}
            />
            <button 
              className={styles.closeBtn} 
              style={{ top: 12, right: 20 }} 
              onClick={() => setPreviewImg(null)}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobSheetDetailPopup({ open, onClose, job, onNext, onBack }) {
  const [showPreview, setShowPreview] = useState(false);

  if (!open || !job) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <span className={styles.close} onClick={onClose}>×</span>
        <div className={styles.header}>
          <span className={styles.sr}>
            {job.srNumber != null ? job.srNumber.toString().padStart(2, "0") : "--"}
          </span>
          <span className={styles.date}>
            <svg width="14" height="14"><rect width="14" height="14" rx="3" fill="#dde4eb" /></svg>
            {formatDate(job.date)}
          </span>
        </div>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>Client Name</div>
            <div className={styles.value}>{job.client?.name || job.clientName || "-"}</div>
          </div>
          <div>
            <div className={styles.label}>Contact Person</div>
            <div className={styles.value}>{job.contactPerson || "-"}</div>
          </div>
        </div>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>Client Address</div>
            <div className={styles.value}>{job.client?.address || "-"}</div>
          </div>
          <div>
            <div className={styles.label}>Assigned Employee</div>
            <div className={styles.value}>
              {job.employee
                ? `${job.employee.firstName || ""} ${job.employee.lastName || ""}`.trim()
                : "-"}
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        {job.jobs && Array.isArray(job.jobs) && job.jobs.length > 0 && (
          <div className={styles.jobsPreview}>
            <div className={styles.jobsTitle}>Job Items ({job.jobs.length})</div>
            {job.jobs.map((jobItem, idx) => (
              <div key={idx} className={styles.jobItemCard}>
                <div className={styles.jobHeader}>
                  <span className={styles.jobNum}>Job #{idx + 1}</span>
                  <span className={styles.material}>{jobItem.material || "No Material"}</span>
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
                    {jobItem.description && (
                      <div className={styles.jobDetail}>
                        <span className={styles.detailLabel}>Description:</span>
                        <span className={styles.detailValue}>{jobItem.description}</span>
                      </div>
                    )}
                    {jobItem.remark && (
                      <div className={styles.jobDetail}>
                        <span className={styles.detailLabel}>Remark:</span>
                        <span className={styles.detailValue}>{jobItem.remark}</span>
                      </div>
                    )}
                    <div className={styles.dimensionsGrid}>
                      <div className={styles.dimItem}>
                        <span className={styles.dimLabel}>Left Height:</span>
                        <span className={styles.dimValue}>{jobItem.lHeight || "--"} ft</span>
                      </div>
                      <div className={styles.dimItem}>
                        <span className={styles.dimLabel}>Right Height:</span>
                        <span className={styles.dimValue}>{jobItem.rHeight || "--"} ft</span>
                      </div>
                      <div className={styles.dimItem}>
                        <span className={styles.dimLabel}>Top Width:</span>
                        <span className={styles.dimValue}>{jobItem.tWidth || "--"} ft</span>
                      </div>
                      <div className={styles.dimItem}>
                        <span className={styles.dimLabel}>Bottom Width:</span>
                        <span className={styles.dimValue}>{jobItem.bWidth || "--"} ft</span>
                      </div>
                    </div>
                    {jobItem.images && Array.isArray(jobItem.images) && jobItem.images.length > 0 && (
                      <div className={styles.imagesSection}>
                        <div className={styles.detailLabel}>Images:</div>
                        <div className={styles.imagesList}>
                          {jobItem.images.map((img, i) => (
                            <img
                              key={i}
                              src={img.base64 || img}
                              alt={`Job Image ${i + 1}`}
                              className={styles.jobThumb}
                              onClick={() => setPreviewImg(img.base64 || img)}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.box}>
          <div>
            <div className={styles.label}>Instructions</div>
            <div className={styles.inputLike}>{job.instructions || "—"}</div>
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button className={styles.backBtn} onClick={onBack}>Edit</button>
          <button className={styles.nextBtn} onClick={onNext}>Close</button>
          <button className={styles.previewBtn} onClick={() => setShowPreview(true)}>
            Preview Job Sheet
          </button>
        </div>
      </div>

      <JobSheetPreview
        open={showPreview}
        jobSheet={job}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}

// function JobSheetPreview({ open, jobSheet, onClose }) {
//   const [previewImg, setPreviewImg] = useState(null);

//   if (!open || !jobSheet) return null;

//   const { client, contactPerson, srNumber, date, instructions } = jobSheet;
//   const jobs = Array.isArray(jobSheet.jobs) ? jobSheet.jobs : [];

//   return (
//     <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
//       <div className={styles.previewBox}>
//         <button className={styles.closeBtn} onClick={onClose}>×</button>
//         <div className={styles.header}>
//           <div className={styles.sheetTitle}>JOB SHEET</div>
//           <img src={logo} alt="Logo" className={styles.logo} />
//         </div>
//         <div className={styles.infoGrid}>
//           <div>
//             <div><b>CLIENT NAME :</b> <span>{client?.name || jobSheet.clientName || "--"}</span></div>
//             <div><b>CONTACT PERSON :</b> <span>{contactPerson || "--"}</span></div>
//           </div>
//           <div>
//             <div><b>DATE :</b> <span>{formatDate(date)}</span></div>
//             <div><b>SR NO :</b> <span>{srNumber || "--"}</span></div>
//           </div>
//         </div>
//         <div className={styles.jobsArea}>
//           {jobs.length === 0 && (
//             <div style={{ color: "#777", padding: "2rem", textAlign: "center" }}>No jobs found.</div>
//           )}
//           {jobs.map((job, idx) => (
//             <div className={styles.jobRow} key={idx}>
//               <div className={styles.leftCol}>
//                 <SizeSchematic 
//                   lHeight={job.lHeight} 
//                   rHeight={job.rHeight} 
//                   tWidth={job.tWidth} 
//                   bWidth={job.bWidth} 
//                   jobNum={idx + 1} 
//                 />
//                 <div className={styles.matRow}>
//                   <span><b>Material:</b> {job.material || "--"}</span>
//                 </div>
//               </div>
//               <div className={styles.rightCol}>
//                 <div className={styles.imgBox}>
//                   {job.images && Array.isArray(job.images) && job.images.length > 0 ? (
//                     job.images.map((img, i) => (
//                       <img
//                         key={i}
//                         src={img.base64 || img}
//                         alt={`Job Image ${i + 1}`}
//                         className={styles.jobImg}
//                         onClick={() => setPreviewImg(img.base64 || img)}
//                         style={{ cursor: "pointer" }}
//                         onError={(e) => {
//                           e.target.src = logo;
//                         }}
//                       />
//                     ))
//                   ) : (
//                     <div className={styles.noImg}>No Image</div>
//                   )}
//                 </div>
//                 <div className={styles.descRow}>
//                   <b>Description:</b> {job.description || "--"}
//                 </div>
//                 {job.remark && (
//                   <div className={styles.remarkRow}>
//                     <b>Remark:</b> {job.remark}
//                   </div>
//                 )}
//                 <div className={styles.dimensionsRow}>
//                   <div className={styles.dimItem}>
//                     <span className={styles.dimLabel}>L:</span>
//                     <span className={styles.dimValue}>{job.lHeight || "--"} ft</span>
//                   </div>
//                   <div className={styles.dimItem}>
//                     <span className={styles.dimLabel}>R:</span>
//                     <span className={styles.dimValue}>{job.rHeight || "--"} ft</span>
//                   </div>
//                   <div className={styles.dimItem}>
//                     <span className={styles.dimLabel}>T:</span>
//                     <span className={styles.dimValue}>{job.tWidth || "--"} ft</span>
//                   </div>
//                   <div className={styles.dimItem}>
//                     <span className={styles.dimLabel}>B:</span>
//                     <span className={styles.dimValue}>{job.bWidth || "--"} ft</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//         {instructions && (
//           <div className={styles.remarksSection}>
//             <b>Instructions:</b>
//             <div>{instructions}</div>
//           </div>
//         )}
        
//         {previewImg && (
//           <div
//             className={styles.imagePreviewBackdrop}
//             onClick={() => setPreviewImg(null)}
//           >
//             <img
//               src={previewImg}
//               alt="Job Full Size"
//               className={styles.imagePreviewBig}
//               onClick={e => e.stopPropagation()}
//             />
//             <button 
//               className={styles.closeBtn} 
//               style={{ top: 12, right: 20 }} 
//               onClick={() => setPreviewImg(null)}
//             >
//               ×
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }