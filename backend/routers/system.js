const express = require('express');
const system = require('../controllers/system');
const system_auth = require('../middlewares/sysauth');
const router = express.Router();

router.post('/generateqr', system_auth, system);

module.exports = router;
