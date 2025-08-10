const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
    classNo: {
        type :String,
        required : true
    },
    advisor1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true 
    },
  advisor2: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Faculty" ,
      required: true
    }
});

const Class = mongoose.model("Class", ClassSchema);
module.exports = Class;