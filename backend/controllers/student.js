const expressAsyncHandler = require('express-async-handler');
const cookieParser=require('cookie-parser');
const jwt=require('jsonwebtoken');  
const System = require('../models/system');
const student = require('../models/student');
const requests = require('../models/request');
const Class = require('../models/Classdb');

const validateQR = expressAsyncHandler(async (req, res) => {
  const { qrId, mail } = req.body;

  if (!qrId || !mail) {
    res.status(400);
    throw new Error("qrId and mail are required");
  }

  const system = await System.findById({mail});
  if (!system || !system.qrData) {
    res.status(404);
    throw new Error("System or QR data not found");
  }

  if (system.qrData.qrId !== qrId) {
    return res.status(401).json({ success: false, message: 'Invalid QR ID' });
  }

  const now = new Date();
  const createdAt = new Date(system.qrData.createdAt);
  const timeDiff = now - createdAt; 
  const maxAge = 30 * 60 * 1000;

  if (timeDiff > maxAge) {
    return res.status(410).json({ success: false, message: 'QR Code has expired' });
  }

  return res.status(200).json({ success: true, message: 'QR Code is valid' });
});

const putAttendance = expressAsyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401);
    throw new Error("Not authenticated");
  }

  const data = jwt.verify(token, process.env.JWT_SECRET);
  const mail = data.mail;

  const user = await student.findOne({ mail }); // ✅ Added await
  if (!user) {
    res.status(401);
    throw new Error("Unauthorized access");
  }

  if (!user.attendance || user.attendance.length === 0) {
    res.status(400);
    throw new Error("No attendance record found");
  }

  const latestAttendance = user.attendance[user.attendance.length - 1];
  latestAttendance.status = 'present';

  const now = new Date();
  const time = now.toTimeString().split(' ')[0]; // HH:MM:SS
  latestAttendance.time = time;

  await user.save();

  res.json({ message: "Attendance updated successfully", time });
});

const sendRequest = expressAsyncHandler(async(req,res)=>{
 
    const token = req.cookies.token;
    const data = jwt.verify(token, process.env.JWT_SECRET);

    const mail = data.mail;

    const { title, description, type, startDate, endDate, startTime, endTime } = req.body;

    const user = await student.findOne({ mail});
    if (!user) {
      res.status(404);
      throw new Error ("user not found");
    }
    const StudentClass = user.StudentClass;
    const cls = await Class.findOne({classNo:StudentClass});
    if (!cls) {
      res.status(404);
      throw new Error("Class not found");
    }
    const advisor1 = cls.advisor1 
    const advisor2 = cls.advisor2;
    if (!advisor1 && !advisor2){ 
      res.status(400);
      throw new Error ("Both advisor fiels are missing");
    }
    if (type === "OD" && (!startTime || !endTime)) {
      res.status(400);
      throw new Error('start and end time required for od')
    }

    const newRequest = await requests.create({
      studentId: user._id,
      advisor1,
      advisor2,
      title,
      description,
      type,
      startDate,
      endDate,
      startTime: type === "OD" ? startTime : null,
      endTime: type === "OD" ? endTime : null,
      status: "Pending"
    });

   res.status(200).json({message : 'request sent'});
});

const Requests = expressAsyncHandler(async(req,res)=>{
  const token = req.cookies.token;
  const data = jwt.verify(token,process.env.JWT_SECRET);
  const mail = data.mail;
  const user = await student.findOne({mail});
  if(!user){
    res.status(401);
    throw new Error ('unauthorized access');
  }
  const id = user._id;
  const requestList = await requests.find({studentId:id}).select("title description status _id");
  res.status(200).json({requests:requestList});
});

module.exports = {validateQR,
  putAttendance,
  sendRequest,
  Requests};