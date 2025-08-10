import React, { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const videoConstraints = {
  facingMode: "user", // front camera
  width: 1280,
  height: 720
};

const SelfieCapture = ({ studentId, qrData, onSuccess, onError }) => {
  const webcamRef = useRef(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const navigate = useNavigate();

  const capture = useCallback(async () => {
    setIsVerifying(true);
    setVerificationStatus(null);
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      
      // Verify location first (within 10-20m of QR code location)
      const isLocationValid = await verifyLocation(qrData.location);
      if (!isLocationValid) {
        throw new Error('You must be within 10-20m of the classroom to mark attendance');
      }

      // Send to backend for face verification
      const response = await axios.post('/api/face/verify', {
        studentId,
        liveImageBase64: imageSrc.split(',')[1] // Remove data URL prefix
      });

      if (response.data.success) {
        setVerificationStatus('success');
        if (onSuccess) onSuccess();
      } else {
        throw new Error(response.data.error || 'Face verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      if (onError) onError(error.message);
    } finally {
      setIsVerifying(false);
    }
  }, [webcamRef, studentId, qrData]);

  const verifyLocation = async (qrLocation) => {
    // Implement your location verification logic here
    // Compare student's current location with qrLocation
    // Return true if within 10-20m range
    return true; // Placeholder - implement actual location check
  };

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
        disabled={isVerifying}
        className={`mt-4 px-4 py-2 rounded transition ${
          isVerifying 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isVerifying ? 'Verifying...' : 'Capture Selfie'}
      </button>

      {verificationStatus === 'success' && (
        <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">
          Attendance marked successfully!
        </div>
      )}

      {verificationStatus === 'error' && (
        <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">
          Verification failed. Please try again.
        </div>
      )}
    </div>
  );
};

export default SelfieCapture;