const express = require('express');
const router = express.Router();
// Placeholder for Inflection AI SDK or fetch implementation
// Since there isn't a standard public SDK widely known like OpenAI's, we'll assume a REST API interaction.

// @route   POST /api/ai/chat
// @desc    Chat with Inflection AI
router.post('/chat', async (req, res) => {
    const { message, history } = req.body;

    try {
        // Check if API key is present
        if (!process.env.INFLECTION_API_KEY || !process.env.INFLECTION_API_URL) {
            // Fallback mock response if not configured, to prevent app crash during dev
            return res.json({
                text: "I am ready to help, but my connection to Inflection AI hasn't been configured yet. Please check the server .env file."
            });
        }

        // Example implementation - Adjust based on actual Inflection API docs
        const response = await fetch(process.env.INFLECTION_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.INFLECTION_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: message,
                context: history // Pass previous messages if supported
            })
        });

        if (!response.ok) {
            throw new Error(`Inflection API Error: ${response.statusText}`);
        }

        const data = await response.json();
        // Assuming data.text or data.response is the field
        res.json({ text: data.text || data.response || "I heard you, but I'm not sure what to say." });

    } catch (err) {
        console.error('AI Error:', err);
        res.status(500).json({ message: 'Error communicating with AI service' });
    }
});

module.exports = router;
