const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agentController");

// POST endpoint for text-to-speech
router.post("/agent", agentController.textToSpeechController);

// GET endpoint for fetching interactions
router.get("/agent/interactions", agentController.gettextToSpeechData);

// Optional: GET endpoint for a specific interaction
router.get("/agent/interactions/:id", agentController.getInteractionById);

module.exports = router;