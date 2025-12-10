import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { SignatureProvider } from "./context/SignatureContext.jsx";
import "./styles.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SignatureProvider>
      <App />
    </SignatureProvider>
  </React.StrictMode>
);
