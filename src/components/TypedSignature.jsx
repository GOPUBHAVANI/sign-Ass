// import React, { useEffect, useRef, useState } from "react";
// import { useSignature } from "../context/SignatureContext.jsx";

// const fonts = [
//   "Great Vibes, cursive",
//   "Pacifico, cursive",
//   "Dancing Script, cursive",
//   "Allura, cursive",
//   "Satisfy, cursive",
//   "Alex Brush, cursive",
//   "Parisienne, cursive",
//   "Sacramento, cursive",
// ];

// const TypedSignature = () => {
//   const canvasRef = useRef(null);
//   const { setSignatureDataUrl, signatureWidth, signatureHeight } = useSignature();

//   const [text, setText] = useState("Your Name");
//   const [fontFamily, setFontFamily] = useState(fonts[0]);
//   const [fontSize, setFontSize] = useState(80);
//   const [fontWeight, setFontWeight] = useState("400");
//   const [color, setColor] = useState("#000000");

//   useEffect(() => {
//     drawSignature();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [text, fontFamily, fontSize, fontWeight, color, signatureWidth, signatureHeight]);

//   const drawSignature = () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     canvas.width = signatureWidth;
//     canvas.height = signatureHeight;

//     const ctx = canvas.getContext("2d");
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     ctx.fillStyle = "rgba(0,0,0,0)"; // transparent
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     ctx.fillStyle = color;
//     ctx.textAlign = "center";
//     ctx.textBaseline = "middle";
//     ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
//     ctx.fillText(text, canvas.width / 2, canvas.height / 2);

//     const pngUrl = canvas.toDataURL("image/png");
//     setSignatureDataUrl(pngUrl);
//   };

//   return (
//     <div>
//       <h6 className="mb-3">Typed Signature</h6>
//       <div className="mb-3">
//         <label className="form-label">Name / Signature Text</label>
//         <input
//           type="text"
//           className="form-control"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//         />
//       </div>

//       <div className="row g-2 mb-3">
//         <div className="col-md-6">
//           <label className="form-label">Font</label>
//           <select
//             className="form-select"
//             value={fontFamily}
//             onChange={(e) => setFontFamily(e.target.value)}
//           >
//             {fonts.map((f) => (
//               <option key={f} value={f} style={{ fontFamily: f }}>
//                 {f.split(",")[0]}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="col-md-3">
//           <label className="form-label">Size</label>
//           <input
//             type="number"
//             className="form-control"
//             min={24}
//             max={150}
//             value={fontSize}
//             onChange={(e) => setFontSize(Number(e.target.value))}
//           />
//         </div>
//         <div className="col-md-3">
//           <label className="form-label">Weight</label>
//           <select
//             className="form-select"
//             value={fontWeight}
//             onChange={(e) => setFontWeight(e.target.value)}
//           >
//             <option value="300">Light</option>
//             <option value="400">Regular</option>
//             <option value="600">Semi-Bold</option>
//             <option value="700">Bold</option>
//           </select>
//         </div>
//       </div>

//       <div className="mb-3">
//         <label className="form-label me-2">Color</label>
//         <input
//           type="color"
//           value={color}
//           onChange={(e) => setColor(e.target.value)}
//         />
//       </div>

//       <canvas
//         ref={canvasRef}
//         className="border rounded w-100"
//         style={{ background: "transparent" }}
//       />
//       <small className="text-muted">
//         This canvas is used to generate a transparent PNG signature.
//       </small>
//     </div>
//   );
// };

// export default TypedSignature;


import React, { useEffect, useRef, useState } from "react";
import { useSignature } from "../context/SignatureContext.jsx";

const fonts = [
  "Great Vibes, cursive",
  "Pacifico, cursive",
  "Dancing Script, cursive",
  "Allura, cursive",
  "Satisfy, cursive",
  "Alex Brush, cursive",
  "Parisienne, cursive",
  "Sacramento, cursive",
];

const TypedSignature = () => {
  const canvasRef = useRef(null);
  const { setSignatureDataUrl, signatureWidth, signatureHeight } = useSignature();

  // 🔹 Start empty – no "Your Name" by default
  const [text, setText] = useState("");
  const [fontFamily, setFontFamily] = useState(fonts[0]);
  const [fontSize, setFontSize] = useState(80);
  const [fontWeight, setFontWeight] = useState("400");
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    drawSignature();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, fontFamily, fontSize, fontWeight, color, signatureWidth, signatureHeight]);

  const drawSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = signatureWidth;
    canvas.height = signatureHeight;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 🔹 If no text, keep transparent and remove signature from context
    if (!text.trim()) {
      setSignatureDataUrl(null);
      return;
    }

    // Transparent background
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw typed text as signature
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const pngUrl = canvas.toDataURL("image/png");
    setSignatureDataUrl(pngUrl);
  };

  return (
    <div>
      <h6 className="mb-3">Typed Signature</h6>

      {/* Text input */}
      <div className="mb-3">
        <label className="form-label">Name / Signature Text</label>
        <input
          type="text"
          className="form-control"
          placeholder="Type your signature here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <small className="text-muted">
          Signature will only be created when you type something.
        </small>
      </div>

      {/* Font controls */}
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <label className="form-label">Font</label>
          <select
            className="form-select"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            {fonts.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f.split(",")[0]}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Size</label>
          <input
            type="number"
            className="form-control"
            min={24}
            max={150}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Weight</label>
          <select
            className="form-select"
            value={fontWeight}
            onChange={(e) => setFontWeight(e.target.value)}
          >
            <option value="300">Light</option>
            <option value="400">Regular</option>
            <option value="600">Semi-Bold</option>
            <option value="700">Bold</option>
          </select>
        </div>
      </div>

      {/* Color */}
      <div className="mb-3 d-flex align-items-center gap-2">
        <label className="form-label mb-0">Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>

      {/* Hidden work canvas (used only to generate PNG) */}
      <canvas
        ref={canvasRef}
        className="border rounded w-100"
        style={{ background: "transparent" }}
      />
      <small className="text-muted d-block mt-1">
        This canvas is used internally to generate a transparent PNG of your typed
        signature.
      </small>
    </div>
  );
};

export default TypedSignature;
