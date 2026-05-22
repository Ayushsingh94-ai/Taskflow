const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  progress: {
    type: String,
    required: true
  },
  hoursWorked: {
    type: Number,
    required: true
  },
  blockers: {
    type: String,
    default: 'None'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('DailyReport', dailyReportSchema);