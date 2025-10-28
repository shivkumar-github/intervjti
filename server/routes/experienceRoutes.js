const express = require('express');
const router = express.Router();

const {
	getExperiences,
	addExperience,
	deleteExperience
} = require('../controllers/experienceController');

router.get('/', getExperiences);
router.post('/', addExperience);
router.delete('/:id', deleteExperience);

module.exports = router;