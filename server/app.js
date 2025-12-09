const path = require('path');
// Explicitly point to the .env file in the same directory as app.js
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

console.log('Loading .env from:', path.join(__dirname, '.env'));
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '*****' + process.env.MONGODB_URI.slice(-10) : 'undefined');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const Bank = require('./models/Bank');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Quick Bank Routes (simple implementation inline for speed)
app.get('/api/banks', async (req, res) => {
    try {
        const banks = await Bank.find();
        res.json(banks);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/banks', async (req, res) => {
    try {
        const bank = new Bank(req.body);
        await bank.save();
        res.status(201).json(bank);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Database Connection
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('FATAL: MONGODB_URI is not defined.');
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
