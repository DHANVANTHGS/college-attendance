const expressAsyncHandler=require('express-async-handler');
const bcrypt = require('bcrypt');
const body_parse=require('body-parser');
const path=require("path");  
require('dotenv').config();
const Student = require('../models/student');
const faculty = require('../models/faculty');
const system = require('../models/system');
const request = require('../models/request');
const jwt=require('jsonwebtoken');

const Domain = "@citchennai.net";

const addUser = expressAsyncHandler(async(req,res)=>{
  console.log('add user included');
   const { name, email, password, dob, year } = req.body;
   
   const StudentClass = req.query.class;
   const department = req.query.department;
  if (!name || !email || !password || !dob || !year ) {
    console.log({name, email, password, dob, year});
    res.status(400);
    throw new Error("All fields are required");
  }

  if(!StudentClass || !department){
    console.log({StudentClass, department});
    res.status(401);
    throw new Error ("Invalid URI");
  }

  if (!email.endsWith("@citchennai.net")) {
    res.status(400);
    throw new Error("Email must end with @citchennai.net");
  }

  const existingStudent = await Student.findOne({ email });
  if (existingStudent) {
    res.status(400);
    throw new Error("Student already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newStudent = await Student.create({
    name,
    mail: email,
    password: hashedPassword,
    dob,
    year,
    StudentClass,
    department,
    attendance: []
  });

  res.status(201).json({
    message: "Student registered successfully",
    studentId: newStudent._id
  });
});

const attendance= expressAsyncHandler(async(req,res)=>{
  const HandlingClass=req.query.class;
  const department = req.query.department;
  if (!HandlingClass || !department) {
  return res.status(401);
  throw new Error ("Invalid URI");
}
  const data = await Student.find({StudentClass:HandlingClass , department:department}).select("name attendance").lean();
  const result = data.map(stud=>{
    const last = stud.attendance?.[stud.attendance.length-1]; 
    return {
      name : stud.name,
      date : last?.date,
      status :last?.status,
      time : last?.time
    };
  });
  console.log(result);
  res.status(200).json({message :'data displayed',students:result});
});

const updateAttendance = expressAsyncHandler(async(req,res)=>{
  console.log('update attendance called');
  const { mail, date, time, status } = req.body;

  if (!mail || !date || !time || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const student = await Student.findOne({ mail });

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const attendanceEntry = student.attendance.find(entry => 
    entry.date === date && entry.time === time
  );

  if (!attendanceEntry) {
    return res.status(404).json({ message: 'Attendance entry not found' });
  }

  attendanceEntry.status = status;

  await student.save();

  res.status(200).json({ message: 'Attendance updated successfully' });
});

const get_Request = expressAsyncHandler(async(req,res)=>{
  const token = req.cookies.token;
  const data = jwt.verify(token, process.env.JWT_SECRET);
  const mail = data.email;
  const user = await faculty.findOne({ mail }).select('_id');
  const requests = await request.find({
  $or: [
    { advisor1: user._id },
    { advisor2: user._id }
  ]
}).select('studentId title description type startDate endDate startTime endTime status').populate('studentId', 'name mail StudentClass').lean();
  if (!requests) {
    res.status(404);
    res.json({message : 'no requests found' });
  }
  res.status(200).json({message :'data fetched',students:requests});
});

const response = expressAsyncHandler(async(req,res)=>{
  const { requestId, status } = req.body;

  if (!requestId || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const request = await request.findById(requestId);

  if (!req) {
    return res.status(404).json({ message: 'Request not found' });
  }
  req.status = status;

  await req.save();

  res.status(200).json({ message: 'Request status updated successfully' });
});

module.exports = {
    addUser,
    attendance,
    updateAttendance,
    get_Request,
    response
};