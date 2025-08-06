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
   const { name, mail, password, dob, year, StudentClass, department } = req.body;

  if (!name || !mail || !password || !dob || !year || !StudentClass || !department) {
    res.status(400);
    throw new Error("All fields are required");
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
    department
  });

  res.status(201).json({
    message: "Student registered successfully",
    studentId: newStudent._id
  });
});

module.exports = {
    addUser
};