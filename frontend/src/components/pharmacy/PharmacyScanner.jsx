import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const PharmacyScanner = () => {
  const [qrData, setQrData] = useState("");
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    const html5QrcodeScanner = new Html5Qrcode("qr-scanner");

    const config = { fps: 10, qrbox: 250 };

    html5QrcodeScanner
      .start(
        { facingMode: "environment" }, // use rear camera
        config,
        (decodedText, decodedResult) => {
          // Success callback
          setQrData(decodedText);
        },
        (errorMessage) => {
          // console.log("Scan error:", errorMessage);
        }
      )
      .catch((err) => console.error("Unable to start scanner:", err));

    return () => {
      html5QrcodeScanner.stop().catch((err) => console.error("Stop failed:", err));
    };
  }, []);

  return (
    <div>
      <h2>Scan Prescription QR</h2>
      <div
        id="qr-scanner"
        ref={scannerRef}
        style={{ width: "300px", margin: "auto" }}
      />
      <p>Scanned QR: {qrData}</p>
    </div>
  );
};

export default PharmacyScanner;
