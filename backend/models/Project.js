const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a project title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a project description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    maxTeamSize: {
      type: Number,
      required: [true, 'Please specify the maximum team size'],
      min: [1, 'Maximum team size must be at least 1'],
      max: [20, 'Maximum team size cannot exceed 20'],
      default: 4
    },
    deadline: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed'],
      default: 'Open'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Project', projectSchema);
