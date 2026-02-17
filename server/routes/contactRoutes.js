const express = require('express');
const router = express.Router();

const { addContactMessage, getAllContactMessages } = require('../controllers/contactController');
const { requireRole } = require('../middleware/requireRole');
const { decodeToken } = require('../middleware/decodeToken');


router.post('/', addContactMessage);
router.get('/',decodeToken, requireRole('admin'), getAllContactMessages);

module.exports = router;