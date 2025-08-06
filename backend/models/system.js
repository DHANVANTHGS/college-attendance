const mongoose = require("mongoose");

const SystemSchema = new mongoose.Schema({
    Systemclass : {
        type : String,
        required : true
    },
    systemID:{
        type :String,
        required :true
    }
});

const system = mongoose.model("System",SystemSchema);
module.exports = system;