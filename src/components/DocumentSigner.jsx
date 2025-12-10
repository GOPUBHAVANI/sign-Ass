import React, { useEffect, useRef, useState } from "react";
import { useSignature } from "../context/SignatureContext.jsx";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument } from "pdf-lib";
import html2canvas from "html2canvas";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DocumentSigner = () => {
  const { signatureDataUrl } = useSignature();

  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null); // "pdf" or "image"
  const [fileUrl, setFileUrl] = useState(null);
  const [arrayBuffer, setArrayBuffer] = useState(null);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  // Signature placement
  const [sigX, setSigX] = useState(50);
  const [sigY, setSigY] = useState(50);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const viewerRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.type === "application/pdf") {
      setFileType("pdf");
    } else if (f.type.startsWith("image/")) {
      setFileType("image");
    } else {
      alert("Please upload a PDF or image file.");
      return;
    }

    setFile(f);
    setPageNumber(1);

    const url = URL.createObjectURL(f);
    setFileUrl(url);

    // For PDF export later, keep ArrayBuffer
    const reader = new FileReader();
    reader.onload = () => {
      setArrayBuffer(reader.result);
    };
    reader.readAsArrayBuffer(f);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

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

    // clamp
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

  const exportImageDocument = async (format) => {
    if (!viewerRef.current) return;
    const canvas = await html2canvas(viewerRef.current, {
      useCORS: true,
      scale: 2,
    });
    const mime = format === "png" ? "image/png" : "image/jpeg";
    const dataUrl = canvas.toDataURL(mime);

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `signed-document.${format}`;
    a.click();
  };

  const exportPdfDocument = async () => {
    if (!arrayBuffer || !signatureDataUrl || !viewerRef.current) {
      alert("Make sure PDF and signature are loaded.");
      return;
    }

    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const page = pages[pageNumber - 1];
    const { width, height } = page.getSize();

    // get container size
    const rect = viewerRef.current.getBoundingClientRect();
    const xRatio = sigX / rect.width;
    const yRatio = sigY / rect.height;

    // load signature image
    const sigBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(sigBytes);

    // base size from image
    const sigDisplayWidth = pngImage.width * 0.4 * scale;
    const sigDisplayHeight = pngImage.height * 0.4 * scale;

    const x = xRatio * width;
    const y = height - yRatio * height - sigDisplayHeight; // PDF y starts bottom

    page.drawImage(pngImage, {
      x,
      y,
      width: sigDisplayWidth,
      height: sigDisplayHeight,
      rotate: (rotation * Math.PI) / 180,
    });

    const modifiedBytes = await pdfDoc.save();
    const blob = new Blob([modifiedBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "signed-document.pdf";
    a.click();
  };

  return (
    <div className="card shadow-sm mt-4 mt-lg-0">
      <div className="card-body">
        <h5 className="card-title mb-3">Document Signer</h5>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="mb-3">
              <label className="form-label">Upload Document (PDF/Image)</label>
              <input
                type="file"
                className="form-control"
                accept="application/pdf,image/png,image/jpeg"
                onChange={handleFileChange}
              />
            </div>

            {fileType === "pdf" && numPages && (
              <div className="mb-3">
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
                      setPageNumber(
                        Math.min(numPages, Math.max(1, Number(e.target.value)))
                      )
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

            <div className="mb-3">
              <h6>Signature Controls</h6>
              {!signatureDataUrl && (
                <small className="text-muted d-block mb-2">
                  Create or upload a signature in &quot;Signature Studio&quot; first.
                </small>
              )}

              <div className="mb-2">
                <label className="form-label">Scale</label>
                <input
                  type="range"
                  className="form-range"
                  min="0.3"
                  max="2"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Rotation (deg)</label>
                <input
                  type="range"
                  className="form-range"
                  min="-45"
                  max="45"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                />
              </div>

              <small className="text-muted">
                Drag the signature directly on the document preview.
              </small>
            </div>

            <div className="mt-3">
              <h6>Export Signed Document</h6>
              <div className="d-flex flex-wrap gap-2">
                {fileType === "image" && (
                  <>
                    <button
                      className="btn btn-outline-primary btn-sm"
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
                    disabled={!file || !signatureDataUrl}
                  >
                    Export Signed PDF
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <h6>Document Preview</h6>
            <div
                ref={viewerRef}
                className="position-relative border bg-white rounded document-viewer"
                >
              {!fileUrl && (
                <div className="d-flex h-100 align-items-center justify-content-center text-muted">
                  Upload a PDF or image to start.
                </div>
              )}

              {fileUrl && fileType === "image" && (
                <img
                  src={fileUrl}
                  alt="Document"
                  className="img-fluid d-block mx-auto"
                  style={{ maxHeight: "100%", objectFit: "contain" }}
                />
              )}

              {fileUrl && fileType === "pdf" && (
                <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                  <Page pageNumber={pageNumber} width={700} />
                </Document>
              )}

              {signatureDataUrl && fileUrl && (
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
