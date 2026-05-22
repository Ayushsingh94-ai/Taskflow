const DailyReport = require('../models/DailyReport');

// Submit daily report (employee)
const submitReport = async (req, res) => {
  try {
    const { task, progress, hoursWorked, blockers } = req.body;

    const report = await DailyReport.create({
      task,
      submittedBy: req.user.id,
      progress,
      hoursWorked,
      blockers
    });

    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all reports (admin sees all, employee sees their own)
const getReports = async (req, res) => {
  try {
    let reports;
    if (req.user.role === 'admin') {
      reports = await DailyReport.find()
        .populate('task', 'title status')
        .populate('submittedBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      reports = await DailyReport.find({ submittedBy: req.user.id })
        .populate('task', 'title status')
        .populate('submittedBy', 'name email')
        .sort({ createdAt: -1 });
    }
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reports for a specific task
const getReportsByTask = async (req, res) => {
  try {
    const reports = await DailyReport.find({ task: req.params.taskId })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { submitReport, getReports, getReportsByTask };