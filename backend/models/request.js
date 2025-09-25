const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  advisor1: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  advisor2: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  type: { type: String, enum: ["OD", "Leave"], required: true },
  title: { type: String, required: true },
  description: {type: String, required: true},
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: {type : String},
  endTime: {type : String},
  status: { type: String, enum: ["Pending", "Accepted", "Denied"], default: "Pending" },
  createdAt: { type: Date, default: Date.now, expires: "30d" } 
});

const requests = mongoose.model("Requests", RequestSchema);
module.exports = requests;