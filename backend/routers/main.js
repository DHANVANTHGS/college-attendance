const express= require('express');
const main = require('../controllers/main');
const router = express.Router();

router.post('/login',main);


module.exports = router;