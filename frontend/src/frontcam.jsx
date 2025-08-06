import React, { useRef, useCallback } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  facingMode: "user", // front camera
};

const SelfieCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (onCapture) {
      onCapture(imageSrc); // Send base64 image back to parent
    }
  }, [webcamRef, onCapture]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="rounded shadow-lg"
      />
      <button
        onClick={capture}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Capture Selfie
      </button>
    </div>
  );
};

export default SelfieCapture;
