const express= require('express');
const staff = require('../controllers/staff');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post('/addUser',auth.userAuth,staff.addUser);
router.get('/attendance',auth.userAuth,staff.attendance);
router.put('updateStatus',auth.userAuth,staff.updateAttendance);

module.exports = router;
