const { textToSpeech } = require("../services/agentService");
const AgentInteraction = require("../models/AgentInteraction");

exports.textToSpeechController = async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const response = await textToSpeech(text, language);

    console.log("Sarvam Response:", response);

    // Save the interaction to database
    await AgentInteraction.create({
      prompt: text,
      response: response,
      language: language || 'en-IN'
    });

    // Get base64 audio correctly
    const audioBase64 =
      response?.audios?.[0] || response?.audio || response?.data;

    if (!audioBase64) {
      return res.status(500).json({
        message: "Audio not received from Sarvam API",
      });
    }

    const audioBuffer = Buffer.from(audioBase64, "base64");

    res.set({
      "Content-Type": "audio/wav",
      "Content-Length": audioBuffer.length,
    });

    res.send(audioBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "TTS generation failed" });
  }
};

// Add the missing function for getting interactions
exports.gettextToSpeechData = async (req, res) => {
  try {
    const interactions = await AgentInteraction.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(50); // Limit to last 50 interactions

    res.status(200).json({
      success: true,
      data: interactions
    });
  } catch (error) {
    console.error("Error fetching interactions:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch interactions" 
    });
  }
};

// Optional: Add a function to get a specific interaction by ID
exports.getInteractionById = async (req, res) => {
  try {
    const { id } = req.params;
    const interaction = await AgentInteraction.findById(id);

    if (!interaction) {
      return res.status(404).json({ 
        success: false, 
        message: "Interaction not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: interaction
    });
  } catch (error) {
    console.error("Error fetching interaction:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch interaction" 
    });
  }
};