import { NextRequest, NextResponse } from "next/server";
import { SarvamAIClient } from "sarvamai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ComplaintResponse {
  subject: string;
  category: string;
  description: string;
  suggestedNextAction: string;
}

function cleanJson(text: string): ComplaintResponse {
  try {
    const raw = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    return JSON.parse(raw);
  } catch (e) {
    // Fallback if model returned unstructured text
    return {
      subject: "Formal Citizen Grievance Regarding Service Deficiency",
      category: "Public Grievance",
      description: text,
      suggestedNextAction:
        "Submit this grievance to the concerned nodal department or CPGRAMS portal (pgportal.gov.in) with relevant documentation.",
    };
  }
}

function getValidAudioConfig(originalType: string, originalName: string) {
  // Strip any codec or parameter flags like ';codecs=opus'
  const rawType = (originalType || "").split(";")[0].trim().toLowerCase();

  const allowedTypes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/mpeg3",
    "audio/x-mpeg-3",
    "audio/x-mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/pcm_s16le",
    "audio/l16",
    "audio/raw",
    "application/octet-stream",
    "audio/aac",
    "audio/x-aac",
    "audio/aiff",
    "audio/x-aiff",
    "audio/ogg",
    "audio/opus",
    "audio/flac",
    "audio/x-flac",
    "audio/mp4",
    "audio/x-m4a",
    "audio/amr",
    "audio/x-ms-wma",
    "audio/webm",
    "video/webm",
  ];

  let contentType = "audio/wav";
  let ext = "wav";

  if (allowedTypes.includes(rawType)) {
    contentType = rawType;
    if (rawType.includes("webm")) ext = "webm";
    else if (rawType.includes("mp4") || rawType.includes("m4a")) ext = "mp4";
    else if (rawType.includes("ogg") || rawType.includes("opus")) ext = "ogg";
    else if (rawType.includes("mp3") || rawType.includes("mpeg")) ext = "mp3";
    else if (rawType.includes("flac")) ext = "flac";
    else if (rawType.includes("wav")) ext = "wav";
  } else {
    // Map inferred types
    if (rawType.includes("webm")) {
      contentType = "audio/webm";
      ext = "webm";
    } else if (rawType.includes("mp4") || rawType.includes("m4a")) {
      contentType = "audio/mp4";
      ext = "mp4";
    } else if (rawType.includes("ogg") || rawType.includes("opus")) {
      contentType = "audio/ogg";
      ext = "ogg";
    } else if (rawType.includes("mp3") || rawType.includes("mpeg")) {
      contentType = "audio/mp3";
      ext = "mp3";
    } else if (rawType.includes("flac")) {
      contentType = "audio/flac";
      ext = "flac";
    } else {
      contentType = "audio/wav";
      ext = "wav";
    }
  }

  let filename = originalName || `recording.${ext}`;
  const currentExt = filename.split(".").pop()?.toLowerCase();
  if (!currentExt || (currentExt === "wav" && ext !== "wav") || currentExt !== ext) {
    filename = `recording.${ext}`;
  }

  return { contentType, filename };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey =
      process.env.SARVAM_API_KEY ||
      process.env.NEXT_PUBLIC_SARVAM_API_KEY ||
      "sk_r2ewccoa_LIsAmFwF0G0ZPplSPWdn65Hd";

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "SARVAM_API_KEY is not configured on the server. Please add it to your environment variables.",
        },
        { status: 500 }
      );
    }

    const client = new SarvamAIClient({
      apiSubscriptionKey: apiKey,
    });

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const directText = formData.get("text") as string | null;

    let originalTranscript = "";
    let translatedTranscript = "";
    let detectedLanguage = "auto";

    if (audioFile && audioFile.size > 0) {
      // Validate file size (max 10MB)
      if (audioFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Audio file exceeds 10MB limit. Please upload or record a shorter clip." },
          { status: 400 }
        );
      }

      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Normalize MIME type & filename for Sarvam AI
      const { contentType, filename } = getValidAudioConfig(
        audioFile.type,
        audioFile.name
      );

      const uploadable = {
        data: buffer,
        filename,
        contentType,
      };

      // 1. Run translate mode to convert any Indic language speech to English
      try {
        const translateRes = await client.speechToText.transcribe({
          file: uploadable,
          model: "saaras:v4",
          mode: "translate",
        });

        translatedTranscript = translateRes.transcript || "";
        detectedLanguage = translateRes.language_code || "Unknown";
      } catch (err: any) {
        console.error("STT Translate Error:", err);
        return NextResponse.json(
          {
            error:
              err?.body?.message ||
              err?.message ||
              "Failed to transcribe and translate audio. Please verify audio clarity and format.",
          },
          { status: 422 }
        );
      }

      // 2. Optionally fetch native-script transcript in parallel/fallback
      try {
        const nativeRes = await client.speechToText.transcribe({
          file: uploadable,
          model: "saaras:v4",
          mode: "transcribe",
        });
        originalTranscript = nativeRes.transcript || translatedTranscript;
      } catch (e) {
        originalTranscript = translatedTranscript;
      }
    } else if (directText && directText.trim().length > 0) {
      translatedTranscript = directText.trim();
      originalTranscript = directText.trim();
      detectedLanguage = "Text Input";
    } else {
      return NextResponse.json(
        { error: "No audio file or text provided. Please record audio or upload a supported sound file." },
        { status: 400 }
      );
    }

    if (!translatedTranscript || translatedTranscript.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not detect clear speech in the audio. Please try speaking closer to your microphone." },
        { status: 422 }
      );
    }

    // 3. Send transcript to Sarvam 105B to generate structured complaint
    const systemPrompt = `You are BhashaBridge, an expert citizen grievance officer and legal aid specialist in India.
Your task is to take a citizen's spoken grievance (translated into English) and structure it into a high-impact, professional formal complaint letter.

You MUST respond ONLY with a valid JSON object with the following exact keys:
{
  "subject": "A concise, formal subject line for the grievance letter",
  "category": "One standard category, e.g., 'Electricity & Power', 'Municipal & Civic Services', 'Consumer Protection & Retail', 'Water Supply & Sewage', 'Banking & Financial Fraud', 'Telecom & Internet', 'Healthcare & Medical Negligence', 'Transport & Traffic', 'Law Enforcement & Police', or 'Government Services'",
  "description": "A comprehensive, professionally written grievance narrative in 2-3 clear paragraphs detailing the incident, date/timeline, emotional & financial impact, deficiency in service, and failure of prior informal attempts.",
  "suggestedNextAction": "Specific, authoritative instructions on where and how to file this grievance (e.g., CPGRAMS at pgportal.gov.in, National Consumer Helpline 1915, State DISCOM CGRF, Municipal Ward Officer, Banking Ombudsman), along with required supporting evidence/documents to attach."
}
Do not include markdown codeblocks or extra text. Output raw JSON only.`;

    const userPrompt = `Citizen Grievance Transcript:
"${translatedTranscript}"

Generate the formal complaint in JSON format.`;

    let complaintData: ComplaintResponse;

    try {
      const chatRes = await client.chat.completions({
        model: "sarvam-105b-conversations",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1200,
        temperature: 0.3,
      });

      const messageContent = chatRes.choices?.[0]?.message?.content || "";
      complaintData = cleanJson(messageContent);
    } catch (chatError: any) {
      console.error("Chat Completion Error:", chatError);
      return NextResponse.json(
        {
          error:
            chatError?.body?.message ||
            chatError?.message ||
            "Failed to structure complaint using Sarvam 105B. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      originalTranscript,
      translatedTranscript,
      detectedLanguage,
      complaint: complaintData,
    });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
