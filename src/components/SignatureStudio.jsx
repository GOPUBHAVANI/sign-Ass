import React, { useState } from "react";
import TypedSignature from "./TypedSignature.jsx";
import DrawSignature from "./DrawSignature.jsx";
import UploadSignature from "./UploadSignature.jsx";
import SignaturePreview from "./SignaturePreview.jsx";

const SignatureStudio = () => {
  const [mode, setMode] = useState("typed");

  return (
    <div className="card shadow-sm float-soft">
      <div className="card-body">
        <h5 className="card-title mb-3 fade-in">Signature Creation</h5>
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button
              className={`nav-link ${mode === "typed" ? "active" : ""}`}
              onClick={() => setMode("typed")}
            >
              Typed
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${mode === "draw" ? "active" : ""}`}
              onClick={() => setMode("draw")}
            >
              Draw
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${mode === "upload" ? "active" : ""}`}
              onClick={() => setMode("upload")}
            >
              Upload
            </button>
          </li>
        </ul>

        <div className="row g-4">
          <div className="col-md-7">
            {mode === "typed" && <TypedSignature />}
            {mode === "draw" && <DrawSignature />}
            {mode === "upload" && <UploadSignature />}
          </div>
          <div className="col-md-5">
            <SignaturePreview />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureStudio;
