const express = require('express');
const { verifyOtp,sendOtp,setPassword, Login, refresh } = require('../controllers/authController');
const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/set-password', setPassword);
router.post('/login', Login);
router.post('/refresh', refresh);

module.exports = router;
