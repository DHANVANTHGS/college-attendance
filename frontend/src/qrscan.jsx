import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import SelfieCapture from "./frontcam.jsx";



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
  const [showSelfie, setShowSelfie] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Haversine distance in meters
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}




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
  const sendSelfieToBackend = async (base64Image) => {
  try {
    
    const response = await fetch("http://localhost:5000/student/matchFace", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64Image }),
    });

    const data = await response.json();
    console.log("Selfie response:", data);

    if (data.status === true) {
      setFeedbackMessage("✅ Attendance marked successfully!");
    } else {
      setFeedbackMessage("❌ Failed to mark attendance.");
    }

    // Wait 2 seconds, then go to login page
    setTimeout(() => {
      window.location.href = "/"; // 👈 change this to your login page route if different
    }, 2000);
    
  } catch (error) {
    console.error("Failed to send selfie:", error);
    setFeedbackMessage("❌ Error sending selfie.");
    setTimeout(() => {
      window.location.href = "/scan";
    }, 2000);
  }
};
const sendToBackend = async (qrData) => {
  try {
    // Parse systemid and qrid from qrData
    const parsed = JSON.parse(qrData);
    const { systemid, qrid } = parsed;

    const response = await fetch("http://localhost:5000/student/scanQr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemid,
        qrid,
        
      }),
    });

    const data = await response.json();
    console.log("Backend response:", data);

    if (data.status === true) {
      setShowSelfie(true);
    } else {
      setFeedbackMessage("Not in Range");
      setTimeout(() => {
        window.location.href = "/";
      }, 2500);
    }

  } catch (err) {
    console.error("Error sending data to backend:", err);
    setFeedbackMessage("Failed to connect to backend");
    setTimeout(() => {
      window.location.href = "/scan";
    }, 2500);
  }
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
         async (decodedText) => {
        try {
          stopScanner();
          setScannedData(decodedText);

          const parsed = JSON.parse(decodedText);
          const scannedLat = parseFloat(parsed.latitude);
          const scannedLng = parseFloat(parsed.longitude);

          if (isNaN(scannedLat) || isNaN(scannedLng)) {
            setFeedbackMessage("Invalid QR location data");
            setTimeout(() => window.location.href = "/scan", 2000);
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const deviceLat = position.coords.latitude;
              const deviceLng = position.coords.longitude;

              const distance = getDistanceFromLatLonInMeters(
                deviceLat, deviceLng,
                scannedLat, scannedLng
              );

              console.log(`📍 Distance = ${distance.toFixed(2)} meters`);

              if (distance <= 15) {
                // ✅ Within range — proceed
                sendToBackend(decodedText, deviceLat, deviceLng);
              } else {
                // ❌ Too far
                setFeedbackMessage("You are not within range (15m)");
                setTimeout(() => window.location.href = "/scan", 2500);
              }
            },
            (error) => {
              console.warn("Geolocation failed:", error);
              setFeedbackMessage("Location access required");
              setTimeout(() => window.location.href = "/scan", 2500);
            }
          );
        } catch (e) {
          console.error("Invalid QR Code format", e);
          setFeedbackMessage("Invalid QR Code");
          setTimeout(() => window.location.href = "/scan", 2500);
        }
      },

      // Optional failure callback
      (errorMessage) => {
        console.warn("QR scan error:", errorMessage);
      }
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

  if (feedbackMessage) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-center">
      <div className="bg-white p-6 rounded shadow-md text-lg font-medium">
        {feedbackMessage}
      </div>
    </div>
  );
}

  return showSelfie ? (
  <SelfieCapture onCapture={sendSelfieToBackend} />
):(
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
