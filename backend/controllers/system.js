const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const express=require('express');

const System = require('../models/system');
const Student = require('../models/student');

const app=express();
app.use(express.json());

const getCurrentDateTime = () => {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];
  return { date, time };
};

const generateQR = expressAsyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401);
    throw new Error("No token provided");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const mail = decoded.email;

  if (!mail) {
    res.status(400);
    throw new Error("Invalid token: No mail ID");
  }

  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    res.status(400);
    throw new Error("Latitude and Longitude are required.");
  }

  const systemData = await System.findOne({mail});
  if (!systemData) {
    res.status(404);
    throw new Error("System not found");
  }

  const { Systemclass } = systemData;
  if (!Systemclass) {
    res.status(400);
    throw new Error("System data missing class");
  }

  const qrId = uuidv4();
  const now = new Date();

  systemData.qrData = {
    qrId,
    latitude,
    longitude,
    createdAt: now
  };
  await systemData.save();

  const students = await Student.find({ StudentClass: Systemclass });
  const { date, time } = getCurrentDateTime();

  await Promise.all(
    students.map(async (student) => {
      student.attendance.push({ status: 'absent', date, time });
      await student.save();
    })
  );

  const qrPayload = {
    qrId,
    mail,
    latitude,
    longitude
  };

  const qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload));

  res.status(200).json({
    qrCode
  });
});

module.exports = generateQR;
