const express= require('express');
const staff = require('../controllers/staff');
const userAuth = require('../middlewares/auth');
const router = express.Router();

router.post('/addUser',userAuth,staff.addUser);
router.get('/attendance',userAuth,staff.attendance);
router.put('/updateStatus',userAuth,staff.updateAttendance);

module.exports = router;
