const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const QRCode = require('qrcode');
const System = require('../models/system');
const Student = require('../models/student');

// Helper to format current time
const getCurrentDateTime = () => {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(' ')[0]; // HH:MM:SS
  return { date, time };
};

const generateQR = expressAsyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401);
    throw new Error("No token provided");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const systemId = decoded.systemId;

  if (!systemId) {
    res.status(400);
    throw new Error("Invalid token: No system ID");
  }

  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    res.status(400);
    throw new Error("Latitude and Longitude are required.");
  }

  const systemData = await System.findById(systemId);
  if (!systemData) {
    res.status(404);
    throw new Error("System not found");
  }

  const {  StudentClass, department } = systemData;
  if (!StudentClass || !department) {
    res.status(400);
    throw new Error("System data missing class or department");
  }

  const students = await Student.find({ StudentClass, department });


  const { date, time } = getCurrentDateTime();

  await Promise.all(
    students.map(async (student) => {
      student.attendance.push({ status: 'absent', date, time });
      await student.save();
    })
  );

  // Prepare QR data with systemId + location
  const qrPayload = {
    systemId,
    latitude,
    longitude
  };

  const qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload));

  res.status(200).json({
    message: 'Attendance initialized and QR code generated',
    qrCode // Base64 PNG string
  });
});

module.exports = generateQR;
