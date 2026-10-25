const User = require('../models/User');
const Project = require('../models/Project');

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

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, skills, interests, experienceLevel } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) {
      user.name = name.trim();
    }

    if (skills !== undefined) {
      user.skills = parseArray(skills);
    }

    if (interests !== undefined) {
      user.interests = parseArray(interests);
    }

    if (experienceLevel) {
      const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
      if (validLevels.includes(experienceLevel)) {
        user.experienceLevel = experienceLevel;
      }
    }

    // Email is intentionally read-only to ensure security and prevent account takeover
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Discover potential teammates with deterministic compatibility scoring
// @route   GET /api/users/teammates
// @access  Private
exports.getTeammates = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Fetch all other registered students
    const candidates = await User.find({ _id: { $ne: currentUserId } }).select(
      'name email skills interests experienceLevel createdAt'
    );

    // 2. Fetch projects owned or joined by the current user to infer complementary skills
    const userProjects = await Project.find({
      $or: [{ owner: currentUserId }, { members: currentUserId }]
    }).select('requiredSkills title');

    // Aggregate all required skills from user's projects into a normalized set
    const projectRequiredSkillsSet = new Set();
    userProjects.forEach((proj) => {
      (proj.requiredSkills || []).forEach((skill) => {
        if (skill) projectRequiredSkillsSet.add(skill.trim().toLowerCase());
      });
    });

    const userSkillsSet = new Set((currentUser.skills || []).map((s) => s.trim().toLowerCase()));
    const userInterestsSet = new Set((currentUser.interests || []).map((i) => i.trim().toLowerCase()));

    // 3. Calculate deterministic compatibility score for each candidate
    const scoredTeammates = candidates.map((candidate) => {
      const candidateSkills = candidate.skills || [];
      const candidateInterests = candidate.interests || [];

      // A. Direct matching skills (skills both current user and candidate have)
      const matchingSkills = [];
      // B. Complementary skills (skills required by user's projects that the candidate has, but current user doesn't)
      const complementarySkills = [];

      candidateSkills.forEach((skill) => {
        const lowerSkill = skill.trim().toLowerCase();
        if (userSkillsSet.has(lowerSkill)) {
          matchingSkills.push(skill);
        } else if (projectRequiredSkillsSet.has(lowerSkill)) {
          complementarySkills.push(skill);
        }
      });

      // C. Shared interests
      const matchingInterests = candidateInterests.filter((interest) =>
        userInterestsSet.has(interest.trim().toLowerCase())
      );

      // Scoring Breakdown:
      // Direct skill matches: up to 40 points (12 pts per matching skill, max 40)
      const skillPoints = Math.min(40, matchingSkills.length * 12 + (matchingSkills.length > 0 ? 4 : 0));

      // Complementary skills: up to 35 points (15 pts per needed project skill, max 35)
      const complementaryPoints = Math.min(35, complementarySkills.length * 15 + (complementarySkills.length > 0 ? 5 : 0));

      // Shared interests: up to 25 points (10 pts per matching interest, max 25)
      const interestPoints = Math.min(25, matchingInterests.length * 10 + (matchingInterests.length > 0 ? 5 : 0));

      // Total deterministic score out of 100
      let totalScore = skillPoints + complementaryPoints + interestPoints;
      if (totalScore > 100) totalScore = 100;

      return {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        skills: candidate.skills,
        interests: candidate.interests,
        experienceLevel: candidate.experienceLevel,
        compatibilityScore: totalScore,
        matchingSkills,
        complementarySkills,
        matchingInterests,
        breakdown: {
          skillPoints,
          complementaryPoints,
          interestPoints
        }
      };
    });

    // 4. Sort descending by compatibility score
    scoredTeammates.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.status(200).json({
      success: true,
      count: scoredTeammates.length,
      userHasProjects: userProjects.length > 0,
      userSkillsCount: currentUser.skills.length,
      teammates: scoredTeammates
    });
  } catch (error) {
    next(error);
  }
};
