const User = require('../models/User');
const Project = require('../models/Project');
const JoinRequest = require('../models/JoinRequest');

// @desc    Get system-wide stats (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const totalProjects = await Project.countDocuments();
    const totalRequests = await JoinRequest.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        studentCount,
        facultyCount,
        adminCount,
        totalProjects,
        totalRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('name email role experienceLevel skills interests createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user's role (Admin only)
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['student', 'faculty', 'admin'];
    if (!role || !validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, faculty, or admin.'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Prevent demoting the last admin or yourself if preferred
    if (user._id.toString() === req.user._id.toString() && role.toLowerCase() !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin privileges.'
      });
    }

    user.role = role.toLowerCase();
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role successfully updated to ${user.role}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account and cascade cleanup (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Cascade: remove user's join requests
    await JoinRequest.deleteMany({ student: id });

    // Cascade: delete projects owned by user and related join requests
    const ownedProjects = await Project.find({ owner: id });
    for (const project of ownedProjects) {
      await JoinRequest.deleteMany({ project: project._id });
      await Project.findByIdAndDelete(project._id);
    }

    // Remove user from team membership in any remaining projects
    await Project.updateMany({ members: id }, { $pull: { members: id } });

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `User ${user.name} and associated records successfully deleted.`
    });
  } catch (error) {
    next(error);
  }
};
