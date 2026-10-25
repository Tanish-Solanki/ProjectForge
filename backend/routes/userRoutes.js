const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getTeammates } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/teammates', protect, getTeammates);

module.exports = router;
