const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['income', 'expense', 'investment'], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    description: String,
    attachment: String,
    bankAccountId: String,
    bankName: String,
    investmentType: String,
    investors: [String],
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
