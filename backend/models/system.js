const mongoose = require("mongoose");

const SystemSchema = new mongoose.Schema({
  Systemclass: {
    type: String,
    required: true
  },
  systemID: {
    type: String,
    required: true
  },
  qrData: {
    qrId: String,
    latitude: String,
    longitude: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
});


const System = mongoose.model("System", SystemSchema);
module.exports = System;