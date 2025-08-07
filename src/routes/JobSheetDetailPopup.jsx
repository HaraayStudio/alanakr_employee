import React, { useState } from "react";
import styles from "./JobSheetDetailPopup.module.scss";
import logo from "../assets/logo.png";
import jb from "../assets/jb.png";
import EditJobSheetPopup from "./EditJobSheetPopup";

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



export default function JobSheetDetailPopup({
  open,
  onClose,
  job,
  onNext,
  onBack,
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewImg, setPreviewImg] = useState(null); // Added this state for image preview
  const [showEditPopup, setShowEditPopup] = useState(null); // Added this state for image preview

  if (!open || !job) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
       
        <div className={styles.header}>
          <span className={styles.sr}> Jobsheet  
            {job.srNumber != null
              ?" "+ job.srNumber.toString().padStart(2, "0")
              : "--"}
          </span>
         <span className={styles.close} onClick={onClose}>
          ×
        </span>
        </div>  <span className={styles.date}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path fillRule="evenodd" clipRule="evenodd" d="M3.77734 9.55551C3.77734 9.31977 3.87099 9.09367 4.03769 8.92698C4.20439 8.76028 4.43048 8.66663 4.66623 8.66663H5.55512C5.79087 8.66663 6.01696 8.76028 6.18366 8.92698C6.35036 9.09367 6.44401 9.31977 6.44401 9.55551V10.4444C6.44401 10.6802 6.35036 10.9062 6.18366 11.0729C6.01696 11.2396 5.79087 11.3333 5.55512 11.3333H4.66623C4.43048 11.3333 4.20439 11.2396 4.03769 11.0729C3.87099 10.9062 3.77734 10.6802 3.77734 10.4444V9.55551ZM5.55512 9.55551V10.4444H4.66623V9.55551H5.55512ZM8.22179 8.66663C7.98604 8.66663 7.75995 8.76028 7.59325 8.92698C7.42655 9.09367 7.3329 9.31977 7.3329 9.55551V10.4444C7.3329 10.6802 7.42655 10.9062 7.59325 11.0729C7.75995 11.2396 7.98604 11.3333 8.22179 11.3333H9.11068C9.34642 11.3333 9.57252 11.2396 9.73921 11.0729C9.90591 10.9062 9.99956 10.6802 9.99956 10.4444V9.55551C9.99956 9.31977 9.90591 9.09367 9.73921 8.92698C9.57252 8.76028 9.34642 8.66663 9.11068 8.66663H8.22179ZM9.11068 9.55551H8.22179V10.4444H9.11068V9.55551ZM10.8885 9.55551C10.8885 9.31977 10.9821 9.09367 11.1488 8.92698C11.3155 8.76028 11.5416 8.66663 11.7773 8.66663H12.6662C12.902 8.66663 13.1281 8.76028 13.2948 8.92698C13.4615 9.09367 13.5551 9.31977 13.5551 9.55551V10.4444C13.5551 10.6802 13.4615 10.9062 13.2948 11.0729C13.1281 11.2396 12.902 11.3333 12.6662 11.3333H11.7773C11.5416 11.3333 11.3155 11.2396 11.1488 11.0729C10.9821 10.9062 10.8885 10.6802 10.8885 10.4444V9.55551ZM11.7773 9.55551H12.6662V10.4444H11.7773V9.55551ZM4.66623 12.2222C4.43048 12.2222 4.20439 12.3158 4.03769 12.4825C3.87099 12.6492 3.77734 12.8753 3.77734 13.1111V14C3.77734 14.2357 3.87099 14.4618 4.03769 14.6285C4.20439 14.7952 4.43048 14.8888 4.66623 14.8888H5.55512C5.79087 14.8888 6.01696 14.7952 6.18366 14.6285C6.35036 14.4618 6.44401 14.2357 6.44401 14V13.1111C6.44401 12.8753 6.35036 12.6492 6.18366 12.4825C6.01696 12.3158 5.79087 12.2222 5.55512 12.2222H4.66623ZM4.66623 13.1111V14H5.55512V13.1111H4.66623ZM7.3329 13.1111C7.3329 12.8753 7.42655 12.6492 7.59325 12.4825C7.75995 12.3158 7.98604 12.2222 8.22179 12.2222H9.11068C9.34642 12.2222 9.57252 12.3158 9.73921 12.4825C9.90591 12.6492 9.99956 12.8753 9.99956 13.1111V14C9.99956 14.2357 9.90591 14.4618 9.73921 14.6285C9.57252 14.7952 9.34642 14.8888 9.11068 14.8888H8.22179C7.98604 14.8888 7.75995 14.7952 7.59325 14.6285C7.42655 14.4618 7.3329 14.2357 7.3329 14V13.1111ZM8.22179 13.1111H9.11068V14H8.22179V13.1111Z" fill="#030304"/>
  <path d="M14.8859 13.3333C15.0037 13.3333 15.1168 13.3801 15.2001 13.4635C15.2835 13.5468 15.3303 13.6599 15.3303 13.7778V14.7049L15.6445 15.0191C15.7255 15.1029 15.7703 15.2152 15.7693 15.3317C15.7682 15.4482 15.7215 15.5597 15.6391 15.6421C15.5567 15.7245 15.4452 15.7713 15.3287 15.7723C15.2122 15.7733 15.0999 15.7285 15.0161 15.6475L14.4414 15.0729V13.7778C14.4414 13.6599 14.4882 13.5468 14.5716 13.4635C14.6549 13.3801 14.768 13.3333 14.8859 13.3333Z" fill="#030304"/>
  <path fillRule="evenodd" clipRule="evenodd" d="M4.66667 2.44444C4.66667 2.32657 4.71349 2.21352 4.79684 2.13017C4.88019 2.04683 4.99324 2 5.11111 2C5.22898 2 5.34203 2.04683 5.42538 2.13017C5.50873 2.21352 5.55556 2.32657 5.55556 2.44444V4.66667C5.55556 4.78454 5.50873 4.89759 5.42538 4.98094C5.34203 5.06429 5.22898 5.11111 5.11111 5.11111C4.99324 5.11111 4.88019 5.06429 4.79684 4.98094C4.71349 4.89759 4.66667 4.78454 4.66667 4.66667V4.22222H3.33333C3.21546 4.22222 3.10241 4.26905 3.01906 4.3524C2.93571 4.43575 2.88889 4.54879 2.88889 4.66667V6.44444H14.4444V4.66667C14.4444 4.54879 14.3976 4.43575 14.3143 4.3524C14.2309 4.26905 14.1179 4.22222 14 4.22222H12.6667V3.33333H14C14.3536 3.33333 14.6928 3.47381 14.9428 3.72386C15.1929 3.97391 15.3333 4.31304 15.3333 4.66667V11.8089C16.1118 11.9214 16.8188 12.3246 17.312 12.9373C17.8052 13.5499 18.0481 14.3267 17.9918 15.1112C17.9355 15.8958 17.5841 16.6299 17.0084 17.1658C16.4328 17.7018 15.6754 17.9998 14.8889 18C14.3873 18.0004 13.893 17.8793 13.4484 17.6471C13.0037 17.415 12.6219 17.0785 12.3356 16.6667H3.33333C2.97971 16.6667 2.64057 16.5262 2.39052 16.2761C2.14048 16.0261 2 15.687 2 15.3333V4.66667C2 4.31304 2.14048 3.97391 2.39052 3.72386C2.64057 3.47381 2.97971 3.33333 3.33333 3.33333H4.66667V2.44444ZM11.7778 14.8889C11.7776 14.1406 12.0471 13.4174 12.5368 12.8517C13.0266 12.286 13.7039 11.9158 14.4444 11.8089V7.33333H2.88889V15.3333C2.88889 15.4512 2.93571 15.5643 3.01906 15.6476C3.10241 15.731 3.21546 15.7778 3.33333 15.7778H11.9067C11.8209 15.4893 11.7775 15.1899 11.7778 14.8889ZM14.8889 17.1111C15.4783 17.1111 16.0435 16.877 16.4602 16.4602C16.877 16.0435 17.1111 15.4783 17.1111 14.8889C17.1111 14.2995 16.877 13.7343 16.4602 13.3175C16.0435 12.9008 15.4783 12.6667 14.8889 12.6667C14.2995 12.6667 13.7343 12.9008 13.3175 13.3175C12.9008 13.7343 12.6667 14.2995 12.6667 14.8889C12.6667 15.4783 12.9008 16.0435 13.3175 16.4602C13.7343 16.877 14.2995 17.1111 14.8889 17.1111Z" fill="#030304"/>
  <path d="M11.3322 5.11111C11.2144 5.11111 11.1013 5.06429 11.018 4.98094C10.9346 4.89759 10.8878 4.78454 10.8878 4.66667V4.22222H6.44336V3.33333H10.8878V2.44444C10.8878 2.32657 10.9346 2.21352 11.018 2.13017C11.1013 2.04683 11.2144 2 11.3322 2C11.4501 2 11.5632 2.04683 11.6465 2.13017C11.7299 2.21352 11.7767 2.32657 11.7767 2.44444V4.66667C11.7767 4.78454 11.7299 4.89759 11.6465 4.98094C11.5632 5.06429 11.4501 5.11111 11.3322 5.11111Z" fill="#030304"/>
</svg>
            {formatDate(job.date)}
          </span>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>Client Name</div>
            <div className={styles.value}>
              {job.client?.name || job.clientName || "-"}
            </div>
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
                ? `${job.employee.firstName || ""} ${
                    job.employee.lastName || ""
                  }`.trim()
                : "-"}
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        {job.jobs && Array.isArray(job.jobs) && job.jobs.length > 0 && (
          <div className={styles.jobsPreview}>
            <div className={styles.jobsTitle}>
              Job Items ({job.jobs.length})
            </div>
            {job.jobs.map((jobItem, idx) => (
              <div key={idx} className={styles.jobItemCard}>
                <div className={styles.jobHeader}>
                  <span className={styles.jobNum}>Job {idx + 1}</span>
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
                       {jobItem.material && (
                      <div className={styles.jobDetail}>
                        <span className={styles.detailLabel}>material:</span>
                       <span className={styles.detailValue}>
  {jobItem.material}
</span>

                      </div>
                    )}
                    {jobItem.description && (
                      <div className={styles.jobDetail}>
                        <span className={styles.detailLabel}>Description:</span>
                        <span className={styles.detailValue}>
                          {jobItem.description}
                        </span>
                      </div>
                    )}
                    {jobItem.remark && (
                      <div className={styles.jobDetail}>
                        <span className={styles.detailLabel}>Remark:</span>
                        <span className={styles.detailValue}>
                          {jobItem.remark}
                        </span>
                      </div>
                    )}
                    <div className={styles.dimensionsGrid}>
                      <div className={styles.dimItem}>
                        <span className={styles.dimLabel}>Left Height:</span>
                        <span className={styles.dimValue}>
                          {jobItem.lHeight || "--"} ft
                        </span>
                      </div>
                      <div className={styles.dimItem}>
                        <span className={styles.dimLabel}>Right Height:</span>
                        <span className={styles.dimValue}>
                          {jobItem.rHeight || "--"} ft
                        </span>
                      </div>
                      <div className={styles.dimItem}>
                        <span className={styles.dimLabel}>Top Width:</span>
                        <span className={styles.dimValue}>
                          {jobItem.tWidth || "--"} ft
                        </span>
                      </div>
                      <div className={styles.dimItem}>
                        <span className={styles.dimLabel}>Bottom Width:</span>
                        <span className={styles.dimValue}>
                          {jobItem.bWidth || "--"} ft
                        </span>
                      </div>
                    </div>
                 
                   {jobItem.images &&
  Array.isArray(jobItem.images) &&
  jobItem.images.length > 0 && (
    <div className={styles.imagesSection}>
      <div className={styles.detailLabel}>Images:</div>
      <div className={styles.imagesList}>
        {jobItem.images.map((img, i) => (
          <img
            key={i}
            src={img.imageUrl || img.base64 || img}
            alt={`Job Image ${i + 1}`}
            className={styles.jobThumb}
            onClick={() => setPreviewImg(img.imageUrl || img.base64 || img)}
            onError={(e) => {
              e.target.style.display = "none";
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
          <button className={styles.backBtn}   onClick={() => setShowEditPopup(true)}>
            Edit
          </button>
          <button className={styles.nextBtn} onClick={onClose}>
            Close
          </button>
          {/* <button
            className={styles.previewBtn}
            onClick={() => setShowPreview(true)}
          >
            Preview Job Sheet
          </button> */}
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
            style={{ position: 'absolute', top: 30 , right: 10, zIndex: 1001 }}
            onClick={() => setPreviewImg(null)}
          >
            ×
          </button>
        </div>
      )}
<EditJobSheetPopup
  open={showEditPopup}
  onClose={() => setShowEditPopup(false)}
  job={job}
  // clients={clientsList}
  // employees={employeesList}
  onSave={(updatedJobSheet) => {
    // Handle successful save
    console.log('Job sheet updated:', updatedJobSheet);
    // Refresh your job sheets list
  }}
/>
    
    </div>
  );
}