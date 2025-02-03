const express = require('express');
const tasksCollection = require('../controller/taskmanagement');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Here 0: Admin, 1: Users
router.post('/task', authenticateToken, authorizeRoles(0, 1), tasksCollection.createTask);
router.get('/tasks', authenticateToken, authorizeRoles(0, 1), tasksCollection.getTasks);
router.get('/tasks/:id', authenticateToken, authorizeRoles(0, 1), tasksCollection.getTaskById);
router.put('/tasks/:id', authenticateToken, authorizeRoles(0, 1), tasksCollection.updateTask);
router.delete('/tasks/:id', authenticateToken, authorizeRoles(0, 1), tasksCollection.deleteTask);

module.exports = router;