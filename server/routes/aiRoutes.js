const express = require("express");
const { askRAG } = require("../services/ragService");

const router = express.Router();

router.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question is required."
            });
        }

        const result = await askRAG(question);

        res.json({
            success: true,
            answer: result.answer,
            sources: result.sources
        });

    } catch (error) {
        console.error("RAG ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate answer."
        });
    }
});

module.exports = router;