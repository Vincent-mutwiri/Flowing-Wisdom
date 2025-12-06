const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// @route   GET /api/posts
// @desc    Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/posts
// @desc    Create a post
router.post('/', async (req, res) => {
    const { userId, username, content } = req.body;
    try {
        const post = new Post({ userId, username, content });
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/posts/:id/like
// @desc    Like/Unlike a post
router.put('/:id/like', async (req, res) => {
    const { userId } = req.body;
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.likedBy.includes(userId)) {
            // Unlike
            post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
            post.likes--;
        } else {
            // Like
            post.likedBy.push(userId);
            post.likes++;

            // Award points to author
            const author = await User.findById(post.userId);
            if (author) {
                author.points += 2;
                await author.save();
            }
        }
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/posts/:id/moderate
// @desc    Moderate a post (Admin)
router.put('/:id/moderate', async (req, res) => {
    const { status } = req.body;
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.status = status;
        await post.save();

        if (status === 'approved') {
            const author = await User.findById(post.userId);
            if (author) {
                author.points += 5;
                await author.save();
            }
        }

        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
