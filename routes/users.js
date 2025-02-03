const express = require('express');
const users = require('../controller/users');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/register', users.registerUser);
router.post('/login', users.loginUser);
router.get('/userslist', authenticateToken, authorizeRoles(0), users.getUsers);

module.exports = router;