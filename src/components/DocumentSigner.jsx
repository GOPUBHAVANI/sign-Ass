import React, { useEffect, useRef, useState } from "react";
import { useSignature } from "../context/SignatureContext.jsx";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, degrees } from "pdf-lib";
import html2canvas from "html2canvas";

// ✅ Correct Vite worker import
import workerSrc from "react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const DocumentSigner = () => {
  const { signatureDataUrl } = useSignature();

  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [arrayBuffer, setArrayBuffer] = useState(null); // Uint8Array
  const [loadingFile, setLoadingFile] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const [sigX, setSigX] = useState(50);
  const [sigY, setSigY] = useState(50);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const viewerRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setPdfError(null);

    if (!f) return;

    if (f.type === "application/pdf") setFileType("pdf");
    else if (f.type.startsWith("image/")) setFileType("image");
    else {
      alert("Please upload a PDF or an image file.");
      return;
    }

    setFile(f);
    setNumPages(null);
    setPageNumber(1);
    setArrayBuffer(null);

    if (f.type === "application/pdf") {
      setLoadingFile(true);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          // Convert to Uint8Array for react-pdf / pdf-lib compatibility
          const u8 = new Uint8Array(reader.result);
          setArrayBuffer(u8);
        } catch (err) {
          console.error("FileReader -> Uint8Array conversion error:", err);
          setPdfError("Failed to read PDF file (conversion error). Check console.");
        } finally {
          setLoadingFile(false);
        }
      };
      reader.onerror = (err) => {
        console.error("FileReader error:", err);
        setPdfError("Failed to read file. See console for details.");
        setLoadingFile(false);
      };
      reader.readAsArrayBuffer(f);
    } else {
      // image: createObjectURL is fine
      setArrayBuffer(null);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (err) => {
    console.error("react-pdf load error:", err);
    setPdfError(err?.message || "Failed to load PDF file. See console.");
  };

  // Drag handlers
  const startDrag = (e) => {
    e.preventDefault();
    if (!viewerRef.current) return;
    const rect = viewerRef.current.getBoundingClientRect();
    setDragging(true);
    setDragOffset({
      x: e.clientX - (rect.left + sigX),
      y: e.clientY - (rect.top + sigY),
    });
  };

  const onDrag = (e) => {
    if (!dragging || !viewerRef.current) return;
    const rect = viewerRef.current.getBoundingClientRect();
    let newX = e.clientX - rect.left - dragOffset.x;
    let newY = e.clientY - rect.top - dragOffset.y;

    newX = Math.max(0, Math.min(newX, rect.width - 50));
    newY = Math.max(0, Math.min(newY, rect.height - 30));

    setSigX(newX);
    setSigY(newY);
  };

  const stopDrag = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  });

  // Export functions...
  const exportImageDocument = async (format) => {
    if (!viewerRef.current) return;
    const canvas = await html2canvas(viewerRef.current, { useCORS: true, scale: 2 });
    const mime = format === "png" ? "image/png" : "image/jpeg";
    const dataUrl = canvas.toDataURL(mime);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `signed-document.${format}`;
    a.click();
  };

  const exportPdfDocument = async () => {
    if (!arrayBuffer || !signatureDataUrl) {
      alert("Make sure PDF and signature are loaded.");
      return;
    }

    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const page = pages[pageNumber - 1];
      const { width, height } = page.getSize();

      const rect = viewerRef.current?.getBoundingClientRect();
      const xRatio = sigX / (rect?.width || 1);
      const yRatio = sigY / (rect?.height || 1);

      const sigBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
      const pngImage = await pdfDoc.embedPng(sigBytes);

      const sigDisplayWidth = pngImage.width * 0.4 * scale;
      const sigDisplayHeight = pngImage.height * 0.4 * scale;

      page.drawImage(pngImage, {
        x: xRatio * width,
        y: height - yRatio * height - sigDisplayHeight,
        width: sigDisplayWidth,
        height: sigDisplayHeight,
        rotate: degrees(rotation),
      });

      const modifiedBytes = await pdfDoc.save();
      const blob = new Blob([modifiedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "signed-document.pdf";
      a.click();
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Failed to export PDF. See console for details.");
    }
  };

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body">
        <h5 className="card-title mb-3">Document Signer</h5>

        <div className="row g-4">
          <div className="col-lg-4">
            <label className="form-label">Upload Document (PDF/Image)</label>
            <input
              type="file"
              className="form-control"
              accept="application/pdf,image/png,image/jpeg"
              onChange={handleFileChange}
            />

            {loadingFile && <div className="mt-2 text-muted">Reading file...</div>}

            {pdfError && (
              <div className="alert alert-danger mt-2" role="alert">
                PDF Error: {pdfError}
              </div>
            )}

            {fileType === "pdf" && numPages && (
              <div className="mb-3 mt-3">
                <label className="form-label">Page</label>
                <div className="input-group input-group-sm">
                  <button
                    className="btn btn-outline-secondary"
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber((p) => p - 1)}
                  >
                    ◀
                  </button>
                  <input
                    type="number"
                    className="form-control"
                    value={pageNumber}
                    onChange={(e) =>
                      setPageNumber(Math.max(1, Math.min(numPages, Number(e.target.value))))
                    }
                  />
                  <span className="input-group-text">/ {numPages}</span>
                  <button
                    className="btn btn-outline-secondary"
                    disabled={pageNumber >= numPages}
                    onClick={() => setPageNumber((p) => p + 1)}
                  >
                    ▶
                  </button>
                </div>
              </div>
            )}

            <hr />

            <h6>Signature Controls</h6>
            <label>Scale</label>
            <input
              type="range"
              className="form-range"
              min="0.3"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
            />

            <label>Rotation (deg)</label>
            <input
              type="range"
              className="form-range"
              min="-45"
              max="45"
              step="1"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
            />

            <div className="mt-3">
              {fileType === "image" && (
                <>
                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => exportImageDocument("png")}
                    disabled={!file || !signatureDataUrl}
                  >
                    Export PNG
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => exportImageDocument("jpg")}
                    disabled={!file || !signatureDataUrl}
                  >
                    Export JPG
                  </button>
                </>
              )}

              {fileType === "pdf" && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={exportPdfDocument}
                  disabled={!arrayBuffer || !signatureDataUrl}
                >
                  Export Signed PDF
                </button>
              )}
            </div>
          </div>

          <div className="col-lg-8">
            <h6>Document Preview</h6>
            <div
              ref={viewerRef}
              className="position-relative border bg-white rounded document-viewer"
              style={{ width: "100%", minHeight: 600, overflow: "auto" }}
            >
              {!file && (
                <div className="d-flex h-100 align-items-center justify-content-center text-muted p-4">
                  Upload a PDF or image to start.
                </div>
              )}

              {/* IMAGE preview */}
              {file && fileType === "image" && (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Document"
                  style={{ width: "100%", objectFit: "contain" }}
                />
              )}

              {/* PDF preview - only render when arrayBuffer available */}
              {file && fileType === "pdf" && (
                  <Document
                    file={file}   // ✔ NO arrayBuffer here
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                  >
                    <Page pageNumber={pageNumber} width={750} />
                  </Document>
              )}

              {signatureDataUrl && file && (
                <img
                  src={signatureDataUrl}
                  alt="Signature overlay"
                  style={{
                    position: "absolute",
                    left: sigX,
                    top: sigY,
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    transformOrigin: "top left",
                    cursor: "move",
                    maxWidth: "250px",
                  }}
                  draggable={false}
                  onMouseDown={startDrag}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSigner;
