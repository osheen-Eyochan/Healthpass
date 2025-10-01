// src/receptionist/QrScanner.jsx
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./QrModal.css";

const QrScanner = forwardRef(({ onScan }, ref) => {
  const qrCodeRegionId = "qr-scanner-region";
  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false);

  // Expose stopScanner to parent
  useImperativeHandle(ref, () => ({
    stopScanner: async () => {
      if (html5QrCodeRef.current && isScanningRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (err) {
          // ignore errors if already stopped
        } finally {
          isScanningRef.current = false;
        }
      }
    },
  }));

  useEffect(() => {
    const scanner = new Html5Qrcode(qrCodeRegionId);
    html5QrCodeRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          if (!isScanningRef.current) return;
          try {
            isScanningRef.current = false;
            await scanner.stop();
          } catch (err) {
            console.warn("Error stopping scanner after scan:", err);
          }
          onScan?.(decodedText);
        },
        (errorMessage) => {
          // optional scan errors
        }
      )
      .then(() => {
        isScanningRef.current = true;
      })
      .catch((err) => console.error("Unable to start scanner:", err));

    return () => {
      if (html5QrCodeRef.current && isScanningRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            isScanningRef.current = false;
          });
      }
    };
  }, [onScan]);

  return (
    <div className="qr-scanner-inner">
      <div id={qrCodeRegionId} className="qr-scanner-box" />
      <p className="qr-instructions">
        Point your camera at the patient QR code
      </p>
    </div>
  );
});

export default QrScanner;
