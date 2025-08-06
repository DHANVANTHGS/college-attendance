const jwt=require('jsonwebtoken');  
const path=require("path");  
const express = require('express');
const system = require('../controllers/system');
const expressAsyncHandler=require('express-async-handler');

const sysAuth = expressAsyncHandler(async(req,res,next)=>{
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const data = jwt.verify(token , process.env.JWT_SECRET);
  const role = data.role;
  const mail = data.mail;
  if(role.toLowerCase() != "staff"){
        res.status(401);
        throw new Error ("Unautherized Access");
  }
  else {
    const check = await system.findOne({mail:mail});
    if(!check){
        res.status(401);
        throw new Error ("unauthorized Access");
    }
    next();
  }
})

module.exports = userAuth;