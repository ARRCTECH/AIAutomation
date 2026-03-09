import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateSpeech } from "../store/slice/ttsSlice";

function TTSPlayer() {
  const dispatch = useDispatch();
  const { audioUrl, loading, error } = useSelector((state) => state.tts);
  const [text, setText] = useState("");

  const handleGenerate = () => {
    if (!text.trim()) {
      alert("Please enter some text");
      return;
    }
    
    // IMPORTANT: Send as { text, language } - matching backend expectation
    dispatch(
      generateSpeech({
        text: text,        // Changed from 'prompt' to 'text'
        language: "en-IN",
      })
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>AI Text to Speech</h2>
      
      <textarea
        rows="4"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to convert to speech..."
        style={{ 
          width: '100%', 
          padding: '10px',
          fontSize: '16px',
          borderRadius: '5px',
          border: '1px solid #ccc'
        }}
      />
      
      <br />
      
      <button 
        onClick={handleGenerate}
        disabled={loading || !text.trim()}
        style={{ 
          marginTop: '15px', 
          padding: '12px 24px',
          backgroundColor: loading || !text.trim() ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        {loading ? "Generating..." : "Generate Speech"}
      </button>
      
      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '5px',
          border: '1px solid #ef9a9a'
        }}>
          Error: {error}
        </div>
      )}
      
      {audioUrl && (
        <div style={{ marginTop: '30px' }}>
          <h3>Generated Audio:</h3>
          <audio 
            controls 
            src={audioUrl} 
            style={{ width: '100%' }}
            autoPlay={false}
          />
        </div>
      )}
    </div>
  );
}

export default TTSPlayer;