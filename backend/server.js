const express=require('express');
const cors =require('cors');
const main = require('./routers/main');
const connectDB = require("./config/config");
const staff = require('./routers/staff');
const system = require('./routers/system');
const student = require('./routers/student');
const cookieParser= require('cookie-parser');
require('dotenv').config({ path: __dirname + '/.env' });


const port = process.env.PORT;


const app = express();
app.use(express.json());
app.use(cookieParser());


connectDB();

const allowedOrigins = ['http://120.0.0.7:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use('/main',main);
app.use('/staff',staff);
app.use('/system',system);
app.use('/student',student);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
  });
});
app.get("/",(req,res) =>{
  res.send("Server is ready")
})
app.listen(port,(req,res)=>{
    console.log(`server is running at http://localhost:${port}`);
})

