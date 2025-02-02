const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const userRoutes = require('./routes/users');
const taskManagementRoutes = require('./routes/taskmanagement');
const db = require('./config/database');

const app = express();
const port = process.env.PORT || 3000;

db.connectToDatabase();

app.use(bodyParser.json());

// Use the user routes
app.use('/api/users', userRoutes);
app.use('/api', taskManagementRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});