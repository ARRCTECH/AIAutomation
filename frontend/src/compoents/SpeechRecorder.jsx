import { useState, useEffect } from "react";
import useSpeechRecognition from "../hooks/useSpeechRecognition";

export default function SpeechRecorder() {
  const { transcript, isListening, startListening, stopListening } =
    useSpeechRecognition();

  const [aiReply, setAiReply] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔊 AI Voice Function
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  // 📡 Send transcript to backend
  const sendToBackend = async (text) => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      setAiReply(data.reply);

      // 🔊 AI speaks
      speak(data.reply);

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // transcript change झाला की backend call
  useEffect(() => {
    if (transcript) {
      sendToBackend(transcript);
    }
  }, [transcript]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <div className="bg-white shadow-xl rounded-2xl p-8 w-[420px] text-center">

        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          🎤 AI Voice Agent
        </h1>

        {/* MIC BUTTON */}
        <button
          onClick={isListening ? stopListening : startListening}
          className={`px-6 py-3 rounded-full text-white font-medium transition ${
            isListening
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isListening ? "Stop Listening" : "Start Talking"}
        </button>

        {/* LISTENING TEXT */}
        {isListening && (
          <p className="mt-4 text-sm text-gray-500 animate-pulse">
            Listening...
          </p>
        )}

        {/* USER TEXT */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border min-h-[80px]">
          <h3 className="text-gray-600 text-sm mb-2">You said:</h3>
          <p className="text-gray-800 font-medium">
            {transcript || "Start speaking..."}
          </p>
        </div>

        {/* AI REPLY */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border min-h-[80px]">
          <h3 className="text-gray-600 text-sm mb-2">AI Reply:</h3>

          {loading ? (
            <p className="text-gray-500">AI is thinking...</p>
          ) : (
            <p className="text-gray-800 font-medium">
              {aiReply || "Waiting for AI response..."}
            </p>
          )}
        </div>

      </div>

    </div>
  );
}