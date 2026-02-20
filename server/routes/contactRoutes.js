const express = require('express');
const router = express.Router();

const { addContactMessage, getAllContactMessages, markContactRead } = require('../controllers/contactController');
const { requireRole } = require('../middleware/requireRole');
const { decodeToken } = require('../middleware/decodeToken');


router.post('/', addContactMessage);
router.get('/', decodeToken, requireRole('admin'), getAllContactMessages);
router.patch('/:id', decodeToken, requireRole('admin'), markContactRead);

module.exports = router;