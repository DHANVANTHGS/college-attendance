const express= require('express');
const system = require('../controllers/system');
const router = express.Router();
const system_auth = express()

router.post('/generateqr',system_auth,system.generateQR);


module.exports = router;