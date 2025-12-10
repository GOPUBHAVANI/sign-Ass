import React, { useEffect, useRef, useState } from "react";
import { useSignature } from "../context/SignatureContext.jsx";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, degrees } from "pdf-lib";
import html2canvas from "html2canvas";

// Vite worker fix
import workerSrc from "react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const DocumentSigner = () => {
  const { signatureDataUrl } = useSignature();

  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [arrayBuffer, setArrayBuffer] = useState(null);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const [sigX, setSigX] = useState(50);
  const [sigY, setSigY] = useState(50);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const viewerRef = useRef(null);
  const pageCanvasRef = useRef(null);


  // FILE UPLOAD HANDLER
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.type === "application/pdf") setFileType("pdf");
    else if (f.type.startsWith("image/")) setFileType("image");
    else return alert("Upload a valid PDF or Image");

    setFile(f);
    setNumPages(null);
    setPageNumber(1);

    // Read arrayBuffer for PDF export
    if (f.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => setArrayBuffer(new Uint8Array(reader.result));
      reader.readAsArrayBuffer(f);
    }
  };

  // REACT-PDF LOAD HANDLERS
  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const onRenderSuccess = () => {
    // Get the actual <canvas> of the current page
    const canvas = viewerRef.current.querySelector("canvas");
    if (canvas) pageCanvasRef.current = canvas;
  };

  // DRAG SIGNATURE
  const startDrag = (e) => {
    e.preventDefault();
    const rect = viewerRef.current.getBoundingClientRect();
    setDragging(true);

    setDragOffset({
      x: e.clientX - (rect.left + sigX),
      y: e.clientY - (rect.top + sigY),
    });
  };

  const onDrag = (e) => {
    if (!dragging) return;

    const rect = viewerRef.current.getBoundingClientRect();
    let newX = e.clientX - rect.left - dragOffset.x;
    let newY = e.clientY - rect.top - dragOffset.y;

    // Allow scrolling — no bounding
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

  
  // EXPORT IMAGE (PNG/JPG)
  
  const exportImageDocument = async (format) => {
    const canvas = await html2canvas(viewerRef.current, { scale: 2 });
    const data = canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg");

    const a = document.createElement("a");
    a.href = data;
    a.download = `signed.${format}`;
    a.click();
  };

  // EXPORT PDF (SIGNATURE POSITION PERFECT)
const exportPdfDocument = async () => {
  if (!file) {
    alert("Please upload a PDF file.");
    return;
  }

  if (fileType !== "pdf") {
    alert("Only PDF export is allowed here.");
    return;
  }

  if (!arrayBuffer) {
    alert("PDF failed to load. Try uploading again.");
    return;
  }

  if (!signatureDataUrl) {
    alert("Please add your signature first.");
    return;
  }

  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const page = pdfDoc.getPages()[pageNumber - 1];
    const { width: pdfWidth, height: pdfHeight } = page.getSize();

    const canvas = pageCanvasRef.current;
    if (!canvas) {
      alert("PDF page canvas not ready yet. Please wait 1 second and try again.");
      return;
    }

    const canvasRect = canvas.getBoundingClientRect();
    const viewerRect = viewerRef.current.getBoundingClientRect();

    // convert DOM position → Canvas position
    const actualX = sigX - (canvasRect.left - viewerRect.left);
    const actualY = sigY - (canvasRect.top - viewerRect.top);

    const xRatio = actualX / canvasRect.width;
    const yRatio = actualY / canvasRect.height;

   const exportPdfDocument = async () => {
  if (!file) return alert("Please upload a PDF file.");
  if (fileType !== "pdf") return alert("Only PDF export is allowed here.");
  if (!arrayBuffer) return alert("PDF failed to load. Try uploading again.");

  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "signed.pdf";
    a.click();
  } catch (err) {
    console.error("PDF Export Error:", err);
    alert("Failed to export PDF. Check console.");
  }
};


    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "signed.pdf";
    a.click();
  } catch (err) {
    console.error("PDF Export Error:", err);
    alert("Failed to export PDF. Check console.");
  }
};

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body">
        <h5>Document Signer</h5>

        {/* ------------------ LEFT PANEL ------------------ */}
        <div className="row g-4">
          <div className="col-lg-4">
            <input
              type="file"
              className="form-control"
              accept="application/pdf,image/png,image/jpeg"
              onChange={handleFileChange}
            />

            {fileType === "pdf" && numPages && (
              <div className="mt-3">
                <label>Page</label>
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
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPageNumber(Math.max(1, Math.min(val, numPages)));
                    }}
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
              min="0.3"
              max="2"
              step="0.1"
              className="form-range"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
            />

            <label>Rotation</label>
            <input
              type="range"
              min="-45"
              max="45"
              step="1"
              className="form-range"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
            />

            <hr />

            {fileType === "image" && (
              <>
                <button
                  className="btn btn-primary btn-sm me-2"
                  onClick={() => exportImageDocument("png")}
                  disabled={!file}
                >
                  Export PNG
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => exportImageDocument("jpg")}
                  disabled={!file}
                >
                  Export JPG
                </button>
              </>
            )}

            {fileType === "pdf" && (
              <button
                className="btn btn-primary btn-sm"
                onClick={exportPdfDocument}
                disabled={!arrayBuffer}
              >
                Export PDF
              </button>
            )}
          </div>

          {/* ------------------ RIGHT PANEL (PREVIEW) ------------------ */}
          <div className="col-lg-8">
            <div
              ref={viewerRef}
              className="border rounded bg-white position-relative"
              style={{
                width: "100%",
                height: "650px",
                overflow: "auto",
              }}
            >
              {!file && (
                <div className="d-flex h-100 align-items-center justify-content-center text-muted">
                  Upload a document to start.
                </div>
              )}

              {fileType === "image" && (
                <img
                  src={URL.createObjectURL(file)}
                  style={{ width: "100%" }}
                />
              )}

              {fileType === "pdf" && (
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(e) => console.log(e)}
                >
                  <Page
                    pageNumber={pageNumber}
                    onRenderSuccess={onRenderSuccess}
                    width={viewerRef.current?.clientWidth - 20}
                  />
                </Document>
              )}

              {/* SIGNATURE OVERLAY */}
              {signatureDataUrl && file && (
                <img
                  src={signatureDataUrl}
                  onMouseDown={startDrag}
                  draggable={false}
                  style={{
                    position: "absolute",
                    left: sigX,
                    top: sigY,
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    transformOrigin: "top left",
                    cursor: "grab",
                    maxWidth: "250px",
                  }}
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
