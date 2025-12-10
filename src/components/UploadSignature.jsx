import React from "react";
import { useSignature } from "../context/SignatureContext.jsx";

const UploadSignature = () => {
  const { setSignatureDataUrl, setSignatureWidth, setSignatureHeight } = useSignature();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG/JPG/SVG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setSignatureWidth(img.width);
        setSignatureHeight(img.height);
        // NOTE: Background removal is optional & advanced.
        // Here we directly use the uploaded image as signature.
        setSignatureDataUrl(reader.result);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h6 className="mb-3">Upload Signature</h6>
      <div className="mb-3">
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          className="form-control"
          onChange={handleFileChange}
        />
      </div>
      <small className="text-muted">
        (Optional enhancement) You can implement white background removal using a
        canvas and pixel manipulation.
      </small>
    </div>
  );
};

export default UploadSignature;
