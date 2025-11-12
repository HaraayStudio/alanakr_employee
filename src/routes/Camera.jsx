import React, { useState } from "react";

export default function UploadSelfie() {
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Take or Upload a Selfie</h2>
      <input
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileUpload}
      />
      {imagePreview && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={imagePreview}
            alt="Selfie preview"
            width="250"
            style={{ borderRadius: "10px" }}
          />
        </div>
      )}
    </div>
  );
}
