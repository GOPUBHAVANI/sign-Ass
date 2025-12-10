import React, { createContext, useContext, useState } from "react";

const SignatureContext = createContext();

export const SignatureProvider = ({ children }) => {
  const [signatureDataUrl, setSignatureDataUrl] = useState(null); // PNG
  const [signatureWidth, setSignatureWidth] = useState(600);
  const [signatureHeight, setSignatureHeight] = useState(200);

  const value = {
    signatureDataUrl,
    setSignatureDataUrl,
    signatureWidth,
    signatureHeight,
    setSignatureWidth,
    setSignatureHeight,
  };

  return (
    <SignatureContext.Provider value={value}>
      {children}
    </SignatureContext.Provider>
  );
};

export const useSignature = () => useContext(SignatureContext);
