const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
  requestJoin,
  getProjectRequests,
  handleJoinRequest
} = require('../controllers/projectController');
const { protect, optionalProtect } = require('../middleware/auth');

// Public or member list
router.get('/', getProjects);
router.post('/', protect, createProject);

// User-specific projects (must be defined before /:id)
router.get('/my-projects', protect, getMyProjects);

// Project specific by ID
router.get('/:id', optionalProtect, getProjectById);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

// Join requests
router.post('/:id/join', protect, requestJoin);
router.get('/:id/requests', protect, getProjectRequests);
router.patch('/:id/requests/:requestId', protect, handleJoinRequest);

module.exports = router;
