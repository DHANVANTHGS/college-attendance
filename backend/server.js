const express=require('express');
const cors =require('cors');
const main = require('./routers/main');
const connectDB = require("./config/config");
const User = require('./routers/user');
require('dotenv').config({ path: __dirname + '/.env' });


const port = process.env.PORT;
app.use(cookieParser());

const app = express();
app.use(express.json());


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
app.use('/user',user);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

app.listen(port,(req,res)=>{
    console.log(`server is running at http://localhost:${port}`);
})

