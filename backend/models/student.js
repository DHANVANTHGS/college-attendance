const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  mail: {
    type: String,
    required: true,
    unique: true,
    match: [/^[a-zA-Z0-9._%+-]+@citchennai\.net$/, 'Please use a valid @citchennai.net email']
  },
  password: {
    type: String,
    required: true
  },
  year : {
    type : Number ,
    required : true
  },
  department : {
    type : String,
    required : true
  },
  dob :{
    type : Date,
    required : true
  },
  StudentClass: {
    type: String,
    required : true
  },
  attendance: [{
     date: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      required: true
    },
    time: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}:\d{2}$/, 'Time must be in HH:MM:SS format']
    }
  }],
  faceid :{
    type : String,
  },
});

const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;