const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    badgeId: {
        type: String,
        required: true,
    },
    unlockedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Badge', badgeSchema);
