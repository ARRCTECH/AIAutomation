import { SarvamAIClient } from "sarvamai";
const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY
});
export async function textToSpeech(prompt,language) {
  const response = await client.textToSpeech.convert({
    text: prompt,
    target_language_code: language || 'en-IN',
    model: 'bulbul:v3'
  });
  return response
}
