const { ObjectId } = require('mongodb');
const dbconfig = require('../config/database');

// Task CRUD Operations

// Create Task
const createTask = async (req, res) => {
    const { title, description, priority, status, dueDate } = req.body;

    if (!title || !description || !priority || !status || !dueDate) {
        return res.status(400).json({ error: 'All task fields are required' });
    }

    if (!req.user.userId) {
        return res.status(400).json({ error: 'Missing user id' });
    }

    try {
        const db = await dbconfig.connectToDatabase();
        const tasksCollection = db.collection('tasks');

        const newTask = { title, description, priority, status, dueDate: new Date(dueDate), userId: req.user.userId };
        const result = await tasksCollection.insertOne(newTask);

        res.status(201).json({ message: 'Task created successfully', taskId: result.insertedId });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Retrieve Tasks with Filters and Pagination
const getTasks = async (req, res) => {
    const { priority, dueDate, page = 1, pageSize = 10 } = req.query;
    const { userId, usertype } = req.user;

    const filters = {};
    if (priority) filters.priority = priority;
    if (dueDate) filters.dueDate = { $gte: new Date(dueDate) };

    try {
        const db = await dbconfig.connectToDatabase();
        const tasksCollection = db.collection('tasks');

        const tasks = await tasksCollection
            .find(filters)
            .skip((page - 1) * parseInt(pageSize))
            .limit(parseInt(pageSize))
            .toArray();

        // Ensure that non-admin users can only access their own tasks
        if (parseInt(usertype) !== 0 && tasks.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.status(200).json({ tasks, page: parseInt(page), pageSize: parseInt(pageSize) });
    } catch (error) {
        console.error('Retrieve tasks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Retrieve Task by ID
const getTaskById = async (req, res) => {
    const { id } = req.params;
    const usertype = req.user.usertype;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid task ID' });
    }

    try {
        const db = await dbconfig.connectToDatabase();
        const tasksCollection = db.collection('tasks');

        const task = await tasksCollection.findOne({ _id: new ObjectId(id) });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Ensure that non-admin users can only access their own tasks
        if (parseInt(usertype) !== 0 && task.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error('Get task by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update Task
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, status, dueDate } = req.body;
    const userId = req.user.userId;
    const usertype = req.user.usertype;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid task ID' });
    }

    try {
        const db = await dbconfig.connectToDatabase();
        const tasksCollection = db.collection('tasks');

        const updatedTask = {
            ...(title && { title }),
            ...(description && { description }),
            ...(priority && { priority }),
            ...(status && { status }),
            ...(dueDate && {
                dueDate: new Date(dueDate),
                ...(userId && { userId })
            })
        };

        const tasks = await tasksCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedTask }
        );

        if (tasks.matchedCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Ensure that non-admin users can only access their own tasks
        if (parseInt(usertype) !== 0 && tasks.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete Task
const deleteTask = async (req, res) => {
    const { id } = req.params;
    const { usertype, userId } = req.user;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid task ID' });
    }

    try {
        const db = await dbconfig.connectToDatabase();
        const tasksCollection = db.collection('tasks');

        const tasks = await tasksCollection.deleteOne({ _id: new ObjectId(id) });

        if (tasks.deletedCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Ensure that non-admin users can only access their own tasks
        if (parseInt(usertype) !== 0 && tasks.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
