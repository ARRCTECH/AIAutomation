const AgentInteraction = require('../models/AgentInteraction');
const { textToSpeech } = require('../services/agentService');
exports.textToSpeechController = async (req, res) => {
  try {
    const { prompt,language } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'Prompt is required and must be a string' });
    }
    const agentResponse = await textToSpeech(prompt, language);
    const interaction = new AgentInteraction({
      prompt,
      response:agentResponse,
      language: language || 'en-IN',
    });
    await interaction.save();
    res.status(201).json({
      success: true,
      data: agentResponse,
      interactionId: interaction._id,
    });
  } catch (error) {
    console.error('Error in runAgent controller:', error);
    res.status(500).json({ message: 'Error running agent', error: error.message });
  }
};
exports.gettextToSpeechData = async (req, res) => {
    try {
        const interactions = await AgentInteraction.find();
        res.status(200).json({
            success: true,
            count: interactions.length,
            data: interactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};