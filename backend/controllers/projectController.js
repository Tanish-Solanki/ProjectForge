const Project = require('../models/Project');
const JoinRequest = require('../models/JoinRequest');
const mongoose = require('mongoose');

// Helper to parse comma-separated or array inputs
const parseArray = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(input)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public (or protected)
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('owner', 'name email skills experienceLevel')
      .populate('members', 'name email skills experienceLevel')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    const { title, description, requiredSkills, maxTeamSize, deadline } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and description for the project.'
      });
    }

    const teamSize = Number(maxTeamSize) || 4;
    if (teamSize < 1) {
      return res.status(400).json({
        success: false,
        message: 'Maximum team size must be at least 1.'
      });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      requiredSkills: parseArray(requiredSkills),
      maxTeamSize: teamSize,
      deadline: deadline ? new Date(deadline) : undefined,
      owner: req.user._id,
      members: [req.user._id], // Creator is automatically added to the team
      status: 'Open'
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: populatedProject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID with user membership & request state
// @route   GET /api/projects/:id
// @access  Public / Private
exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID format.' });
    }

    const project = await Project.findById(id)
      .populate('owner', 'name email skills experienceLevel')
      .populate('members', 'name email skills experienceLevel interests');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check relationship if user is logged in
    let userRelation = {
      isOwner: false,
      isMember: false,
      hasPendingRequest: false,
      existingRequest: null
    };

    if (req.user) {
      const userIdStr = req.user._id.toString();
      userRelation.isOwner = project.owner._id.toString() === userIdStr;
      userRelation.isMember = project.members.some((m) => m._id.toString() === userIdStr);

      const existingReq = await JoinRequest.findOne({
        project: project._id,
        student: req.user._id
      });

      if (existingReq) {
        userRelation.existingRequest = existingReq;
        userRelation.hasPendingRequest = existingReq.status === 'Pending';
      }
    }

    res.status(200).json({
      success: true,
      project,
      userRelation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project (Only owner)
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, requiredSkills, maxTeamSize, deadline, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID format.' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Ownership check
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the project owner can edit this project.'
      });
    }

    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (requiredSkills !== undefined) project.requiredSkills = parseArray(requiredSkills);

    if (maxTeamSize !== undefined) {
      const newMax = Number(maxTeamSize);
      if (newMax < project.members.length) {
        return res.status(400).json({
          success: false,
          message: `Maximum team size cannot be less than current member count (${project.members.length}).`
        });
      }
      project.maxTeamSize = newMax;
    }

    if (deadline !== undefined) {
      project.deadline = deadline ? new Date(deadline) : null;
    }

    if (status) {
      const validStatuses = ['Open', 'In Progress', 'Completed'];
      if (validStatuses.includes(status)) {
        project.status = status;
      }
    }

    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project (Only owner)
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID format.' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Ownership check
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the project owner can delete this project.'
      });
    }

    // Clean up associated join requests
    await JoinRequest.deleteMany({ project: id });
    await Project.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Project and associated join requests deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's projects (Created & Joined)
// @route   GET /api/projects/my-projects
// @access  Private
exports.getMyProjects = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Projects created by user
    const createdProjects = await Project.find({ owner: userId })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    // Projects joined by user where user is NOT the owner
    const joinedProjects = await Project.find({
      members: userId,
      owner: { $ne: userId }
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      createdProjects,
      joinedProjects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a request to join a project
// @route   POST /api/projects/:id/join
// @access  Private
exports.requestJoin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID format.' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check project status
    if (project.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'This project is marked as Completed and is no longer accepting new members.'
      });
    }

    // Check if user is the project owner
    if (project.owner.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You are the owner of this project and already a member.'
      });
    }

    // Check if already a member
    const alreadyMember = project.members.some((m) => m.toString() === userId.toString());
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this project.'
      });
    }

    // Check team size limit
    if (project.members.length >= project.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: 'This project has already reached its maximum team size.'
      });
    }

    // Check for existing request
    let joinRequest = await JoinRequest.findOne({ project: id, student: userId });
    if (joinRequest) {
      if (joinRequest.status === 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending join request for this project.'
        });
      } else if (joinRequest.status === 'Accepted') {
        return res.status(400).json({
          success: false,
          message: 'Your join request has already been accepted.'
        });
      } else {
        // If previously rejected, allow re-requesting by setting status back to Pending
        joinRequest.status = 'Pending';
        joinRequest.createdAt = new Date();
        await joinRequest.save();

        return res.status(200).json({
          success: true,
          message: 'Join request resubmitted successfully.',
          joinRequest
        });
      }
    }

    // Create new join request
    joinRequest = await JoinRequest.create({
      project: id,
      student: userId,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Join request submitted successfully. The project owner will review it.',
      joinRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get join requests for a project (Owner only)
// @route   GET /api/projects/:id/requests
// @access  Private
exports.getProjectRequests = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID format.' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Authorization check: Only project owner can view requests
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the project owner can view join requests.'
      });
    }

    const requests = await JoinRequest.find({ project: id })
      .populate('student', 'name email skills interests experienceLevel')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept or reject a join request (Owner only)
// @route   PATCH /api/projects/:id/requests/:requestId
// @access  Private
exports.handleJoinRequest = async (req, res, next) => {
  try {
    const { id, requestId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be either "Accepted" or "Rejected".'
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Authorization check: Only project owner can accept or reject
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the project owner can accept or reject join requests.'
      });
    }

    const joinRequest = await JoinRequest.findOne({ _id: requestId, project: id });
    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found for this project.'
      });
    }

    // Prevent approving own request check
    if (joinRequest.student.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot approve a join request for yourself.'
      });
    }

    if (status === 'Accepted') {
      // Check maximum team size
      if (project.members.length >= project.maxTeamSize) {
        return res.status(400).json({
          success: false,
          message: `Cannot accept request. Team is already at maximum capacity (${project.maxTeamSize}).`
        });
      }

      // Add student to project members if not already there
      const studentIdStr = joinRequest.student.toString();
      const alreadyInTeam = project.members.some((m) => m.toString() === studentIdStr);
      if (!alreadyInTeam) {
        project.members.push(joinRequest.student);
        await project.save();
      }
    }

    joinRequest.status = status;
    await joinRequest.save();

    const updatedProject = await Project.findById(id)
      .populate('owner', 'name email')
      .populate('members', 'name email skills experienceLevel');

    res.status(200).json({
      success: true,
      message: `Join request marked as ${status}.`,
      joinRequest,
      project: updatedProject
    });
  } catch (error) {
    next(error);
  }
};
