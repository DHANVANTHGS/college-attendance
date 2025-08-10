const express = require('express');
const router = express.Router();
const faceVerificationController = require('../controllers/faceVerificationController');
const studentAuth = require('../middlewares/studentAuth'); // Use your exact student auth middleware

// Basic face verification route - just auth + controller
router.post('/verify', studentAuth, faceVerificationController.verifyFace);

module.exports = router;