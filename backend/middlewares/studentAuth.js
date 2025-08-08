const jwt=require('jsonwebtoken');  
const path=require("path");  
const express = require('express');
const student = require('../models/student');
const system = require('../models/system');
const expressAsyncHandler=require('express-async-handler');

const studentAuth = expressAsyncHandler(async (req,res,next)=>{
    const token = req.cookies.token;
    if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
    data = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
    const role = data.role;
    if(role.toLowerCase() != "student"){
        res.status(403);
        throw new Error ("Unautherized Role");
    }
    const mail = data.mail;
    const user = await student.findOne({mail});
    if(!user){
        res.status(401);
        throw new Error ("Unautherized Access");
    }
    next();
     // for further verification class has to be added in token and cross verify with it 
});

module.exports = studentAuth;