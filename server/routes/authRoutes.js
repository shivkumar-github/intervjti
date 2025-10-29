const express = require('express');
const { verifyOtp,sendOtp } = require('../controllers/authController');
const router = express.Router();

router.post('/send-otp', sendOtp);

router.post('/verify-otp', verifyOtp);

module.exports = router;
