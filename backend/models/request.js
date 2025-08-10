const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "student", required: true },
  advisor1: { type: mongoose.Schema.Types.ObjectId, ref: "faculty", required: true },
  advisor2: { type: mongoose.Schema.Types.ObjectId, ref: "faculty", required: true },
  type: { type: String, enum: ["OD", "Leave"], required: true },
  title: { type: String, required: true },
  description: {type: String, required: true},
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  startTime: {type : String},
  endTime: {type : String},
  status: { type: String, enum: ["Pending", "Accepted", "Denied"], default: "Pending" },
  createdAt: { type: Date, default: Date.now, expires: "30d" } // auto-delete after 30 days
});

const requests = mongoose.model("Requests", RequestSchema);
module.exports = requests;