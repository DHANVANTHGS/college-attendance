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
  class: {
    type: String,
    required : true
  },
  attendence: [{
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
    required : true
  }
});

const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;