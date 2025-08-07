const expressAsyncHandler=require('express-async-handler');
const bcrypt = require('bcrypt');
const body_parse=require('body-parser');
const cookieParser=require('cookie-parser');
const jwt=require('jsonwebtoken');  
const path=require("path");  
require('dotenv').config();
const student = require('../models/student');
const faculty = require('../models/faculty');
const system = require('../models/system');

const modelMap = {
  student: student,
  staff: faculty,
  system: system,
};

const Domain = "@citchennai.net";

const login = expressAsyncHandler(async (req,res) =>{
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('All fields are required');
  }
 
  if(!email.endsWith(Domain)){
        res.status(400);
        throw new Error(`Only emails with ${emailDomain} are allowed`);
  }
  const model = modelMap[role.toLowerCase()];
  if (!model) {
    res.status(400);
    throw new Error('Invalid role');
  }
  const user =  await model.findOne({mail:email});
  console.log(user);
  if(!user){
    res.status(404);
    throw new Error('User not found');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (password != user.password) {
    res.status(401);
    throw new Error('Incorrect password');
  }

  const token = jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(200).json({ message: 'Login successful', token });

});

module.exports = login