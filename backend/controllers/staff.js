const expressAsyncHandler=require('express-async-handler');
const bcrypt = require('bcrypt');
const body_parse=require('body-parser');
const path=require("path");  
require('dotenv').config();
const Student = require('../models/student');
const faculty = require('../models/faculty');
const system = require('../models/system');

const Domain = "@citchennai.net";

const addUser = expressAsyncHandler(async(req,res)=>{
   const { name, mail, password, dob, year } = req.body;
   
   const StudentClass = req.query.class;
   const department = req.query.department;
  if (!name || !mail || !password || !dob || !year ) {
    res.status(400);
    throw new Error("All fields are required");
  }

  if(!StudentClass || !department){
    res.status(401);
    throw new Error ("Invalid URI");
  }

  if (!mail.endsWith("@citchennai.net")) {
    res.status(400);
    throw new Error("Email must end with @citchennai.net");
  }

  const existingStudent = await Student.findOne({ mail });
  if (existingStudent) {
    res.status(400);
    throw new Error("Student already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newStudent = await Student.create({
    name,
    mail,
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
  const result = data.map(data=>{
    const last = data.attendance?.[data.attendance.length-1]; 
    return {
      name : data.name,
      date : last?.date,
      status :last?.status,
      time : last?.time
    };
  });
  res.status(200).json({message :'data displayed'});
});

const updateAttendance = expressAsyncHandler(async(req,res)=>{
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

module.exports = {
    addUser,
    attendance,
    updateAttendance
};