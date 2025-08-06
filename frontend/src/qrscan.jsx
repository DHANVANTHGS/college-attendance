import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScannerPage = () => {
  const scannerRef = useRef(null);
  const timerRef = useRef(null);
  const isRunningRef = useRef(false);

  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [timer, setTimer] = useState(20);
  const [scannedData, setScannedData] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [error, setError] = useState("");

  const fetchCameras = async () => {
    try {
      const cameras = await Html5Qrcode.getCameras();
      setAvailableCameras(cameras);

      // Try to select front camera by label
      const preferred = cameras.find((cam) =>
        /front|user|integrated/i.test(cam.label)
      );

      setSelectedCameraId(preferred ? preferred.id : cameras[0]?.id || "");
    } catch (err) {
      setError("Unable to access cameras.");
    }
  };
  const sendToBackend = (qrData, latitude, longitude) => {
  fetch("http://localhost:5000/api/scan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      qrData,
      location: {
        latitude,
        longitude,
      },
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Backend response:", data);
    })
    .catch((err) => {
      console.error("Error sending data to backend:", err,latitude,longitude);
    });
};


  const startScanner = async () => {
    setError("");
    setScannedData("");
    setTimer(20);
    setScannerActive(true);

    const qrRegionId = "qr-reader";
    const scannerElement = document.getElementById(qrRegionId);
    if (!scannerElement) return;

    const html5QrCode = new Html5Qrcode(qrRegionId);
    scannerRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        selectedCameraId,
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          setScannedData(decodedText);
          stopScanner();
    navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log(latitude,longitude)
      
      sendToBackend(decodedText, latitude, longitude);
    },
    (error) => {
      console.warn("Geolocation denied or failed:", error);
      sendToBackend(decodedText, null, null); // Or handle differently
    }
  );

        },
        () => {}
      );

      isRunningRef.current = true;

      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            stopScanner();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Camera access was denied or failed to start.");
    }
  };

  const stopScanner = async () => {
    clearInterval(timerRef.current);
    setScannerActive(false);

    if (scannerRef.current && isRunningRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.warn("Stop error:", err);
      }
      isRunningRef.current = false;
    }
  };

  useEffect(() => {
    fetchCameras();
    return () => stopScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scannerActive && selectedCameraId) {
      const checkDOMAndStart = () => {
        const el = document.getElementById("qr-reader");
        if (el) {
          startScanner();
        } else {
          setTimeout(checkDOMAndStart, 50);
        }
      };
      checkDOMAndStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerActive, selectedCameraId]);

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-indigo-900 to-teal-900 px-6 sm:px-8 md:px-12 flex justify-center pt-10" id="kl">

      {/* Responsive background image */}
      <div
  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none"
  style={{
    backgroundImage: "url('/bg-shape.png')",
    transform: 'scale(1.2)'
  }}
/>

<div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-xl shadow-2xl text-center border border-gray-300 bg-white"

  /*style={{
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Nearly solid white
    color: '#000', // Ensure text is black and sharp
  }}*/
>

        <h2 className="text-2xl font-bold mb-4">QR Code Scanner</h2>

        {availableCameras.length > 1 && (
          <div className="mb-4">
            <label htmlFor="camera" className="block text-sm mb-1">
              Select Camera:
            </label>
            <select
              id="camera"
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            >
              {availableCameras.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label || `Camera ${cam.id}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {scannerActive ? (
          <>
            <div id="qr-reader" style={{ width: "100%" }}></div>
            <p className="mt-4 text-sm text-gray-500">
              Time remaining: {timer}s
            </p>
          </>
        ) : (
          <>
            <div className="mt-4 text-red-500 font-medium">Scanner stopped.</div>
            <button
              onClick={() => setScannerActive(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={!selectedCameraId}
            >
              Start Scanner
            </button>
          </>
        )}

        {scannedData && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
            <strong>Scanned:</strong><br />
            {scannedData}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerPage;
