import React, { useState } from "react";
import SignatureStudio from "./components/SignatureStudio.jsx";
import DocumentSigner from "./components/DocumentSigner.jsx";

const App = () => {
  const [activeTab, setActiveTab] = useState("signature");

  return (
      <div className="bg-transparent min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container">
          <span className="navbar-brand fw-bold">
            Custom Signature Creator
          </span>

        </div>
      </nav>


      <div className="container pb-5 fade-in">
        <ul className="nav nav-pills mb-3">
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "signature" ? "active" : ""
              }`}
              onClick={() => setActiveTab("signature")}
            >
              1. Signature Studio
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "document" ? "active" : ""
              }`}
              onClick={() => setActiveTab("document")}
            >
              2. Document Signer
            </button>
          </li>
        </ul>

        {activeTab === "signature" ? <SignatureStudio /> : <DocumentSigner />}
      </div>
    </div>
  );
};

export default App;
