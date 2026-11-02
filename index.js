import fs from "fs";
import { SarvamAIClient } from "sarvamai";

// Load environment variables from .env if not already loaded
if (process.loadEnvFile) {
  try {
    process.loadEnvFile(".env");
  } catch (e) {
    // .env might already be injected by runtime
  }
}

const apiKey = process.env.SARVAM_API_KEY;

if (!apiKey) {
  console.error("Error: SARVAM_API_KEY is not set in environment or .env file.");
  process.exit(1);
}

const client = new SarvamAIClient({
  apiSubscriptionKey: apiKey,
});

async function main() {
  const audioFilePath = "sample.wav";

  // If a sample audio file doesn't exist yet, generate a short spoken audio sample using Sarvam's TTS
  if (!fs.existsSync(audioFilePath)) {
    console.log("Generating sample speech audio for transcription...");
    const ttsResponse = await client.textToSpeech.convert({
      text: "नमस्ते, सर्वम एआई में आपका स्वागत है।",
      language_code: "hi-IN",
      model: "bulbul:v3",
    });

    if (ttsResponse.audios && ttsResponse.audios.length > 0) {
      const audioBuffer = Buffer.from(ttsResponse.audios[0], "base64");
      fs.writeFileSync(audioFilePath, audioBuffer);
      console.log(`Saved sample audio to ${audioFilePath}`);
    }
  }

  console.log(`Transcribing audio file: ${audioFilePath} with model saaras:v4...`);

  // Call Sarvam Speech-to-Text API
  const response = await client.speechToText.transcribe({
    file: fs.createReadStream(audioFilePath),
    model: "saaras:v4",
    mode: "transcribe",
  });

  console.log("\n--- Speech-to-Text Result ---");
  console.log("Transcript:", response.transcript);
  console.log("Detected Language:", response.language_code);
  console.log("Request ID:", response.request_id);
}

main().catch((err) => {
  console.error("API Call Failed:", err.message || err);
  if (err.statusCode) console.error("Status Code:", err.statusCode);
  if (err.body) console.error("Error Details:", JSON.stringify(err.body, null, 2));
  process.exit(1);
});
