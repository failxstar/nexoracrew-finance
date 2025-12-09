const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, position } = req.body;

        // Check existing
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already exists' });

        // Hash password (simple) - for production use bcrypt
        // Using bcrypt locally if installed, else simple check (demo purpose) but installed bcryptjs
        // const hashedPassword = await bcrypt.hash(password, 10);

        // For simplicity/compatibility with potential frontend expectations just saving as is or simple hash
        // The previous frontend seemed to rely on simple logic. Let's do it properly with bcrypt.
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword, position });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Return user without password
        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json({ user: userObj, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const userObj = user.toObject();
        delete userObj.password;

        res.json({ user: userObj, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
