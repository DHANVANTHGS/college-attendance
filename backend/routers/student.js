const express= require('express');
const student = require('../controllers/student');
const studentAuth = require('../middlewares/studentAuth');
const router = express.Router();

router.post('/putattendance',studentAuth,student.putAttendance);
router.post('/validateQr',studentAuth,student.validateQR);
router.post('/sendRequest',studentAuth,student.sendRequest);
router.get('/requests',studentAuth,student.Requests);


module.exports = router;