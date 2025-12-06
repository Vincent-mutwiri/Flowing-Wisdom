const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const User = require('../models/User');
const Badge = require('../models/Badge');

// Helper to check badges (Simplified version of mockDb logic)
const checkBadges = async (userId) => {
    const user = await User.findById(userId);
    const logs = await Log.find({ userId });
    const existingBadges = await Badge.find({ userId });

    const badgesToAward = [];

    // 1. First Step
    if (logs.length >= 1 && !existingBadges.find(b => b.badgeId === 'first-log')) {
        badgesToAward.push('first-log');
    }

    // 2. Week Warrior (Streak >= 7)
    if (user.currentStreak >= 7 && !existingBadges.find(b => b.badgeId === 'week-warrior')) {
        badgesToAward.push('week-warrior');
    }

    // 3. Super Star (Points >= 100)
    if (user.points >= 100 && !existingBadges.find(b => b.badgeId === 'super-star')) {
        badgesToAward.push('super-star');
    }

    for (const badgeId of badgesToAward) {
        await new Badge({ userId, badgeId }).save();
    }
};

// @route   GET /api/logs/:userId
// @desc    Get logs for a user
router.get('/:userId', async (req, res) => {
    try {
        const logs = await Log.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/logs
// @desc    Create or update a log
router.post('/', async (req, res) => {
    const { userId, date, mood, symptoms, flow, notes } = req.body;

    try {
        let log = await Log.findOne({ userId, date });

        if (log) {
            // Update existing
            log.mood = mood;
            log.symptoms = symptoms;
            log.flow = flow;
            log.notes = notes;
            await log.save();
        } else {
            // Create new
            log = new Log({ userId, date, mood, symptoms, flow, notes });
            await log.save();

            // Gamification: Update Streak & Points
            const user = await User.findById(userId);
            if (user) {
                const today = new Date(date);
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                const hasYesterdayLog = await Log.findOne({ userId, date: yesterdayStr });

                if (hasYesterdayLog) {
                    user.currentStreak += 1;
                } else {
                    // Reset streak if not consecutive, but here we are just adding a log. 
                    // If the user missed a day, the streak logic in a real app is more complex.
                    // For now, we'll just set it to 1 if it's 0 or if they missed yesterday.
                    // Simplified: If no yesterday log, reset to 1.
                    user.currentStreak = 1;
                }

                user.points += 10;
                await user.save();

                await checkBadges(userId);
            }
        }
        res.json(log);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/logs/badges/:userId
// @desc    Get user badges
router.get('/badges/:userId', async (req, res) => {
    try {
        const badges = await Badge.find({ userId: req.params.userId });
        res.json(badges);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/logs/leaderboard/top
// @desc    Get leaderboard
router.get('/leaderboard/top', async (req, res) => {
    try {
        const users = await User.find().sort({ points: -1 }).limit(10);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
