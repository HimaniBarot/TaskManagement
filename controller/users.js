const dbconfig = require('../config/database');
const bcrypt = require('bcrypt');
require('dotenv').config();

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const loginUser = async (req, res) => {
    const { email, password, usertype } = req.body;

    if (!email || !password || !usertype) {
        return res.status(400).json({ error: 'Email, password and user type are required' });
    }

    try {
        const db = await dbconfig.connectToDatabase();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.email, usertype: user.usertype }, JWT_SECRET, {
            expiresIn: '1h', // Token expires in 1 hour
        });

        return res.status(200).json({ message: 'Login successful', userId: user._id, token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const registerUser = async (req, res) => {
    const { username, email, password, usertype } = req.body;

    if (!email || !password || !usertype) {
        return res.status(400).json({ error: `Email, password and user type are required` });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        const db = await dbconfig.connectToDatabase();
        const usersCollection = db.collection('users');

        // Check if the email is already registered
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await usersCollection.insertOne(
            {
                username: username || '',
                email,
                password: hashedPassword,
                usertype: parseInt(usertype),
                usertypeText: parseInt(usertype) === 0 ? 'admin' : 'user'
            });

        return res.status(201).json({ message: 'User registered successfully', userId: result.insertedId });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const getUsers = async (req, res) => {
    try {
        const db = await dbconfig.connectToDatabase();
        const usersCollection = db.collection('users');

        // Example: Fetch data from the collection
        const findResult = await usersCollection.find({}).toArray();

        return res.status(201).json({ message: 'User list retrived successfully', userslist: findResult });
    } catch (error) {
        console.error('Retrive user error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { registerUser, loginUser, getUsers };
