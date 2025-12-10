import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useSignature } from "../context/SignatureContext.jsx";

const DrawSignature = () => {
  const sigPadRef = useRef(null);
  const { setSignatureDataUrl, setSignatureWidth, setSignatureHeight } = useSignature();

  const handleClear = () => {
    sigPadRef.current?.clear();
    setSignatureDataUrl(null);
  };

  const handleSave = () => {
    if (!sigPadRef.current || sigPadRef.current.isEmpty()) return;

    // ❌ OLD (causing error):
    // const canvas = sigPadRef.current.getTrimmedCanvas();

    // ✅ NEW: use plain canvas (no trim-canvas dependency)
    const canvas = sigPadRef.current.getCanvas();

    // store size
    setSignatureWidth(canvas.width);
    setSignatureHeight(canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    setSignatureDataUrl(dataUrl);
  };

  return (
    <div>
      <h6 className="mb-3">Draw Signature</h6>
      <div className="border rounded bg-white mb-2">
        <SignatureCanvas
          ref={sigPadRef}
          penColor="black"
          canvasProps={{
            width: 600,
            height: 200,
            className: "w-100",
          }}
        />
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-outline-secondary btn-sm" onClick={handleClear}>
          Clear
        </button>
        <button className="btn btn-primary btn-sm" onClick={handleSave}>
          Save as Signature
        </button>
      </div>
      <small className="text-muted d-block mt-2">
        Draw using mouse or touch, then click &quot;Save as Signature&quot;.
      </small>
    </div>
  );
};

export default DrawSignature;
