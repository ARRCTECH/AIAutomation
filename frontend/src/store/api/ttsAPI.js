import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Using port 3000 as your backend runs on 3000

export const generateSpeechAPI = async (data) => {
  try {
    console.log('API Request:', { 
      url: `${API_URL}/agent`, 
      data: {
        text: data.text,
        language: data.language
      }
    });
    
    const response = await axios.post(
      `${API_URL}/agent`,
      {
        text: data.text,        // Send as 'text' not 'prompt'
        language: data.language
      },
      {
        responseType: "blob",
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('API Response status:', response.status);
    console.log('API Response type:', response.data.type);
    
    // Check if response is an error (if it's JSON instead of audio)
    if (response.data.type === 'application/json') {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          try {
            const error = JSON.parse(reader.result);
            reject(new Error(error.message || 'Server error'));
          } catch (e) {
            reject(new Error('Invalid error response from server'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read error response'));
        reader.readAsText(response.data);
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('API Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to server. Make sure backend is running on port 3000');
    }
    
    throw error;
  }
};