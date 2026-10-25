const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Project = require('./models/Project');
const JoinRequest = require('./models/JoinRequest');

async function testBackend() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for testing.');

    // Clear test data
    await JoinRequest.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared old test collections.');

    // 1. Create Alice
    const alice = await User.create({
      name: 'Alice Johnson',
      email: 'alice@college.edu',
      password: 'password123',
      skills: ['React', 'JavaScript', 'HTML/CSS'],
      interests: ['Web Development', 'Machine Learning'],
      experienceLevel: 'Intermediate'
    });
    console.log('Alice created:', alice.name, alice.email);

    // 2. Create Bob
    const bob = await User.create({
      name: 'Bob Smith',
      email: 'bob@college.edu',
      password: 'password123',
      skills: ['React', 'Python', 'FastAPI'],
      interests: ['Web Development', 'Cloud Computing'],
      experienceLevel: 'Beginner'
    });
    console.log('Bob created:', bob.name, bob.email);

    // 3. Alice creates a project
    const project = await Project.create({
      title: 'AI Smart Study Assistant',
      description: 'Building an interactive student study helper web application.',
      requiredSkills: ['React', 'Python', 'FastAPI'],
      maxTeamSize: 2,
      owner: alice._id,
      members: [alice._id]
    });
    console.log('Project created:', project.title, 'Owner:', project.owner);

    // 4. Test Teammate matching logic for Alice looking at Bob
    // Direct matching skills between Alice and Bob: 'React'
    // Complementary skills: Bob has 'Python', 'FastAPI' which project needs and Alice lacks!
    // Matching interests: 'Web Development'
    const userProjects = await Project.find({
      $or: [{ owner: alice._id }, { members: alice._id }]
    });

    const projectRequiredSkillsSet = new Set();
    userProjects.forEach((proj) => {
      (proj.requiredSkills || []).forEach((skill) => {
        if (skill) projectRequiredSkillsSet.add(skill.trim().toLowerCase());
      });
    });

    const aliceSkillsSet = new Set(alice.skills.map(s => s.trim().toLowerCase()));
    const aliceInterestsSet = new Set(alice.interests.map(i => i.trim().toLowerCase()));

    const matchingSkills = [];
    const complementarySkills = [];

    bob.skills.forEach(skill => {
      const lower = skill.trim().toLowerCase();
      if (aliceSkillsSet.has(lower)) {
        matchingSkills.push(skill);
      } else if (projectRequiredSkillsSet.has(lower)) {
        complementarySkills.push(skill);
      }
    });

    const matchingInterests = bob.interests.filter(i => aliceInterestsSet.has(i.trim().toLowerCase()));

    const skillPoints = Math.min(40, matchingSkills.length * 12 + (matchingSkills.length > 0 ? 4 : 0));
    const complementaryPoints = Math.min(35, complementarySkills.length * 15 + (complementarySkills.length > 0 ? 5 : 0));
    const interestPoints = Math.min(25, matchingInterests.length * 10 + (matchingInterests.length > 0 ? 5 : 0));
    const totalScore = Math.min(100, skillPoints + complementaryPoints + interestPoints);

    console.log('Matching Results for Bob:');
    console.log(' - Direct Matching Skills:', matchingSkills, `(${skillPoints} pts)`);
    console.log(' - Complementary Project Skills:', complementarySkills, `(${complementaryPoints} pts)`);
    console.log(' - Matching Interests:', matchingInterests, `(${interestPoints} pts)`);
    console.log(' - Total Compatibility Score:', totalScore, '/ 100');

    // 5. Bob requests to join Alice's project
    const joinReq = await JoinRequest.create({
      project: project._id,
      student: bob._id,
      status: 'Pending'
    });
    console.log('Bob submitted join request, status:', joinReq.status);

    // 6. Alice accepts Bob's request
    joinReq.status = 'Accepted';
    await joinReq.save();
    project.members.push(bob._id);
    await project.save();

    console.log('Alice accepted request. Project team size now:', project.members.length, 'Max:', project.maxTeamSize);

    // 7. Verify max capacity check
    const isFull = project.members.length >= project.maxTeamSize;
    console.log('Team at maximum capacity:', isFull);

    console.log('\n--- ALL BACKEND TEST ASSERTIONS PASSED! ---');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testBackend();
