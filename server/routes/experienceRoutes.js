const express = require('express');
const router = express.Router();
const { decodeToken }  = require('../middleware/decodeToken');
const {requireRole} = require('../middleware/requireRole');

const {
	getExperience,
	getExperiences,
	getUserExperiences,
	getExperiencesAdmin,
	addExperience,
	deleteExperience,
	updateExperienceStatus
	
} = require('../controllers/experienceController');
const { decodeTokenIfExists } = require('../middleware/decodeTokenIfExists');

router.get('/', decodeTokenIfExists, getExperiences);
router.get('/users/me/experiences', decodeToken, requireRole('student'), getUserExperiences);
router.get('/adminExperiences', decodeToken, requireRole('admin'), getExperiencesAdmin);
router.post('/', decodeToken, requireRole('student'), addExperience);

router.patch('/:id/status', decodeToken, requireRole('admin'), updateExperienceStatus);
router.get('/:id', decodeTokenIfExists, getExperience);
router.delete('/:id', deleteExperience);

module.exports = router;