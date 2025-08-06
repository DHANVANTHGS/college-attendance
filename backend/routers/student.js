const express= require('express');
const student = require('../controllers/rq');
const router = express.Router();

router.post('/putattendence',student);


module.exports = router;