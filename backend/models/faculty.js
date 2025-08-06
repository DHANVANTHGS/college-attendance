const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
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
  password :{
    type : String,
    required : true
  },
  HandlingClass : {
    type : String,
    default : 'NA'
  },
  HOD : {
    type : Boolean,
    required : true
  }
});

const faculty = mongoose.model("Faculty", facultySchema);
module.exports = faculty;