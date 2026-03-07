const express = require('express');
const router = express.Router();

// Controllers
const agentController = require('../controllers/agentController');

// Routes
router.post('/agent', agentController.textToSpeechController);
router.get('/agent/interactions', agentController.gettextToSpeechData);

module.exports = router;