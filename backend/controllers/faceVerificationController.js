const { spawn } = require('child_process');
const path = require('path');
const Student = require('../models/student');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const net = require('net');

// Helper function to connect to Python socket server
async function verifyWithPython(liveImage, storedImage) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    const PORT = 5001;
    const HOST = '127.0.0.1';
    const TIMEOUT = 10000; // 10 seconds timeout

    client.connect(PORT, HOST, () => {
      const payload = JSON.stringify({
        live: liveImage,
        stored: storedImage
      });
      client.write(payload);
    });

    client.setTimeout(TIMEOUT);
    
    let response = '';
    client.on('data', (data) => {
      response += data.toString();
    });

    client.on('close', () => {
      try {
        const result = response.trim();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });

    client.on('timeout', () => {
      client.destroy();
      reject(new Error('Connection timeout'));
    });

    client.on('error', (err) => {
      client.destroy();
      reject(err);
    });
  });
}

// Face verification endpoint
const verifyFace = async (req, res) => {
  try {
    const { studentId, liveImageBase64 } = req.body;
    
    // Validate input
    if (!studentId || !liveImageBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get student's stored image from database
    const student = await Student.findById(studentId).select('faceImage');
    if (!student || !student.faceImage) {
      return res.status(404).json({ error: 'Student or face image not found' });
    }

    // Verify face with Python server
    const verificationResult = await verifyWithPython(liveImageBase64, student.faceImage);
    
    // Handle verification result
    if (verificationResult === 'MATCH') {
      // Update attendance
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0];
      
      await Student.findByIdAndUpdate(studentId, {
        $push: {
          attendance: {
            date: now,
            status: 'present',
            time: timeString,
            verifiedBy: 'face'
          }
        }
      });

      return res.json({ 
        success: true,
        message: 'Attendance marked successfully'
      });
    } else if (verificationResult === 'NO_MATCH') {
      return res.status(400).json({ 
        error: 'Face verification failed - no match' 
      });
    } else if (verificationResult === 'NO_FACE') {
      return res.status(400).json({ 
        error: 'No face detected in one or both images' 
      });
    } else {
      return res.status(500).json({ 
        error: `Face verification error: ${verificationResult}` 
      });
    }
  } catch (error) {
    console.error('Face verification error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during face verification' 
    });
  }
};

// Add this to your exports
module.exports = {
  verifyFace
};