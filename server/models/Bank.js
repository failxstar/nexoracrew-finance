const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    name: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    branch: { type: String, required: true },
    balance: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Bank', bankSchema);
