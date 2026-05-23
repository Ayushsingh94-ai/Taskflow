const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTaskStatus, deleteTask, getEmployees } = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/employees', protect, adminOnly, getEmployees);
router.get('/', protect, getTasks);
router.post('/', protect, adminOnly, createTask);
router.put('/:id', protect, updateTaskStatus);
router.delete('/:id', protect, adminOnly, deleteTask);

module.exports = router;