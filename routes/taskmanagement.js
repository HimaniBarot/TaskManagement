const express = require('express');
const tasksCollection = require('../controller/taskmanagement');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/task', authenticateToken, authorizeRoles('admin', 'user'), tasksCollection.createTask);
router.get('/tasks', authenticateToken, authorizeRoles('admin', 'user'), tasksCollection.getTasks);
router.get('/tasks/:id', authenticateToken, authorizeRoles('admin', 'user'), tasksCollection.getTaskById);
router.put('/tasks/:id', authenticateToken, authorizeRoles('admin', 'user'), tasksCollection.updateTask);
router.delete('/tasks/:id', authenticateToken, authorizeRoles('admin', 'user'), tasksCollection.deleteTask);

module.exports = router;