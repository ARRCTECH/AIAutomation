// chatController.js
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let conversationHistory = [
  {
    role: "system",
    content: "You are a helpful AI sales agent.",
  },
];

// ✅ Export sahi tarike se karo
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    conversationHistory.push({
      role: "user",
      content: message,
    });

    const completion = await groq.chat.completions.create({
      messages: conversationHistory,
      model: "llama-3.3-70b-versatile",
    });

    const reply = completion.choices[0].message.content;

    conversationHistory.push({
      role: "assistant",
      content: reply,
    });

    res.json({ reply });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ module.exports sahi karo
module.exports = sendMessage;  // Sirf function export karo, object nahi