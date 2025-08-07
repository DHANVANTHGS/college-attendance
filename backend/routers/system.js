const express= require('express');
const system = require('../controllers/system');
const system_auth = require('../middlewares/sysauth');
const router = express.Router();
const system_auth = express()

router.post('/generateqr',system_auth.sysAuth,system.generateQR);


module.exports = router;