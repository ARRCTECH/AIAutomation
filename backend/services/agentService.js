const { SarvamAIClient } = require("sarvamai");

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY,
});

exports.textToSpeech = async (text, language) => {
  const response = await client.textToSpeech.convert({
    text: text,
    target_language_code: language || "en-IN",
    model: "bulbul:v3",
  });

  return response;
};