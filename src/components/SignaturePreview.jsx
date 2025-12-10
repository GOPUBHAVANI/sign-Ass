import React, { useRef, useState } from "react";
import { useSignature } from "../context/SignatureContext.jsx";

const SignaturePreview = () => {
  const {
    signatureDataUrl,
    signatureWidth,
    signatureHeight,
    setSignatureWidth,
    setSignatureHeight,
  } = useSignature();
  const exportCanvasRef = useRef(null);

  const [preset, setPreset] = useState("600x200");
  const [customWidth, setCustomWidth] = useState(600);
  const [customHeight, setCustomHeight] = useState(200);

  const parseSize = () => {
    if (preset === "custom") {
      return { w: customWidth, h: customHeight };
    }
    const [w, h] = preset.split("x").map(Number);
    return { w, h };
  };

  const exportSignature = (format) => {
    if (!signatureDataUrl) {
      alert("No signature selected/created yet.");
      return;
    }

    const { w, h } = parseSize();
    const canvas = exportCanvasRef.current;
    const img = new Image();
    img.onload = () => {
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");

      if (format === "jpg") {
        ctx.fillStyle = "#ffffff"; // white background for JPG
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Fit signature proportionally
      const scale = Math.min(w / img.width, h / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = (w - drawW) / 2;
      const dy = (h - drawH) / 2;

      ctx.drawImage(img, dx, dy, drawW, drawH);

      const mime = format === "png" ? "image/png" : "image/jpeg";
      const dataUrl = canvas.toDataURL(mime);

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `signature.${format}`;
      a.click();

      setSignatureWidth(w);
      setSignatureHeight(h);
    };
    img.src = signatureDataUrl;
  };
  return (
    <div className="signature-preview-card fade-in">
      <h6 className="mb-3">Signature Preview & Export</h6>
      <div className="border rounded bg-white d-flex align-items-center justify-content-center mb-3 signature-preview-box">
        {signatureDataUrl ? (
          <img
            src={signatureDataUrl}
            alt="Signature preview"
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        ) : (
          <span className="text-muted">No signature yet. Create or upload one.</span>
        )}
      </div>

      <div className="mb-2">
        <label className="form-label">Export Size</label>
        <select
          className="form-select mb-2"
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
        >
          <option value="300x100">300 × 100</option>
          <option value="600x200">600 × 200</option>
          <option value="custom">Custom</option>
        </select>
        {preset === "custom" && (
          <div className="row g-2 mb-2">
            <div className="col-6">
              <input
                type="number"
                className="form-control"
                placeholder="Width"
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
              />
            </div>
            <div className="col-6">
              <input
                type="number"
                className="form-control"
                placeholder="Height"
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      <div className="d-flex gap-2 mb-2">
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => exportSignature("png")}
          disabled={!signatureDataUrl}
        >
          Download PNG (transparent)
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => exportSignature("jpg")}
          disabled={!signatureDataUrl}
        >
          Download JPG (white bg)
        </button>
      </div>

      <canvas ref={exportCanvasRef} className="d-none" />
      <small className="text-muted d-block">
        The signature is kept with transparent background for document signing.
      </small>
    </div>
  );
};

export default SignaturePreview;
