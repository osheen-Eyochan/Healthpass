import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Html5Qrcode } from "html5-qrcode";

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

    // Start scanning
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          if (!isScanningRef.current) return; // avoid double stop
          try {
            isScanningRef.current = false; // mark as stopped
            await scanner.stop();
          } catch (err) {
            console.warn("Error stopping scanner after scan:", err);
          }
          onScan?.(decodedText);
        },
        (errorMessage) => {
          // Optional: scan errors
        }
      )
      .then(() => {
        isScanningRef.current = true;
      })
      .catch((err) => console.error("Unable to start scanner:", err));

    return () => {
      // Cleanup safely
      if (html5QrCodeRef.current && isScanningRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {}) // ignore errors
          .finally(() => {
            isScanningRef.current = false;
          });
      }
    };
  }, [onScan]);

  return (
    <div>
      <div id={qrCodeRegionId} style={{ width: "100%", height: "250px" }} />
      <p style={{ marginTop: "10px", textAlign: "center" }}>
        Point your camera at the patient QR code
      </p>
    </div>
  );
});

export default QrScanner;
