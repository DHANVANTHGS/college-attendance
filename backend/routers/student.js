const express= require('express');
const student = require('../controllers/student');
const studentAuth = require('../middlewares/studentAuth');
const router = express.Router();

router.post('/putattendence',studentAuth,student);


module.exports = router;