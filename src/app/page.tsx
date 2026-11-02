"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Download,
  Sparkles,
  FileText,
  AlertCircle,
  Volume2,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Languages,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface ComplaintData {
  subject: string;
  category: string;
  description: string;
  suggestedNextAction: string;
}

interface ApiResponse {
  success: boolean;
  originalTranscript: string;
  translatedTranscript: string;
  detectedLanguage: string;
  complaint: ComplaintData;
  error?: string;
}

const SAMPLE_SCENARIOS = [
  {
    title: "बिजली बिल शिकायत (Hindi)",
    subtitle: "High Billing & Meter Sparking",
    language: "Hindi",
    text: "नमस्ते, पिछले दो महीने से मेरा बिजली का मीटर बहुत तेज चल रहा है और उसमें से बार-बार चिंगारी निकल रही है। मैंने बिजली ऑफिस में दो बार शिकायत की लेकिन कोई सुनवाई नहीं हुई। मुझे बहुत डर लग रहा है कि कोई बड़ा हादसा न हो जाए और बिल भी बहुत ज्यादा आ रहा है। कृपया जल्द से जल्द मीटर बदलवाएं।",
  },
  {
    title: "पाणी पुरवठा समस्या (Marathi)",
    subtitle: "Contaminated Water Supply",
    language: "Marathi",
    text: "नमस्कार, आमच्या परिसरात गेल्या आठवड्यापासून नळाला खूप घाण आणि दुर्गंधीयुक्त पाणी येत आहे. कॉलनीतील अनेक लहान मुले आजारी पडली आहेत. महापालिकेच्या पाणीपुरवठा विभागाकडे अर्ज देऊनही अद्याप कोणतीही कारवाई झालेली नाही. कृपया पाण्याची तातडीने तपासणी करून स्वच्छ पाणीपुरवठा सुरू करावा.",
  },
  {
    title: "E-Commerce Refund Fraud (Hinglish)",
    subtitle: "Defective Product & No Refund",
    language: "Hinglish",
    text: "Hello, maine 15 din pehle ek laptop order kiya tha online shopping portal se. Jo product deliver hua woh damaged screen ke sath aaya. Maine return request raise ki lekin delivery agent ne pick karne se mana kar diya aur portal pe status 'Delivered & Completed' dikha raha hai. Customer care koi response nahi de raha hai aur mera 45000 rupaye fasa hua hai.",
  },
];

export default function Home() {
  const [inputMode, setInputMode] = useState<"record" | "upload" | "presets">("record");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedPresetText, setSelectedPresetText] = useState<string | null>(null);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [result, setResult] = useState<ApiResponse | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"complaint" | "transcripts">("complaint");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Audio timer
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 29) {
            // Saaras sync REST supports up to 30 seconds
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorMsg(null);
    setAudioBlob(null);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200); // 200ms slice
      setIsRecording(true);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setErrorMsg(
        "Microphone access was denied or not found. Please allow microphone permissions or use file upload."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File size exceeds 10MB limit. Please upload a smaller audio clip.");
      return;
    }

    setUploadedFile(file);
    setAudioBlob(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File size exceeds 10MB limit. Please upload a smaller audio clip.");
      return;
    }

    setUploadedFile(file);
    setAudioBlob(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const toggleAudioPlay = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const resetAll = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setUploadedFile(null);
    setSelectedPresetText(null);
    setResult(null);
    setErrorMsg(null);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    setLoadingStep(1);

    try {
      const formData = new FormData();

      if (inputMode === "presets" && selectedPresetText) {
        formData.append("text", selectedPresetText);
      } else if (audioBlob) {
        formData.append("audio", audioBlob, uploadedFile?.name || "voice_complaint.wav");
      } else {
        setErrorMsg("Please record your voice, upload an audio file, or pick a sample scenario.");
        setIsLoading(false);
        return;
      }

      // Step progression animation
      const stepTimer1 = setTimeout(() => setLoadingStep(2), 1200);
      const stepTimer2 = setTimeout(() => setLoadingStep(3), 2800);

      const response = await fetch("/api/generate-complaint", {
        method: "POST",
        body: formData,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to process audio and generate complaint.");
      }

      setResult(data);
      setLoadingStep(4);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const downloadComplaintTxt = () => {
    if (!result) return;
    const { complaint, detectedLanguage, originalTranscript, translatedTranscript } = result;

    const content = `===================================================================
BHASHABRIDGE FORMAL CITIZEN GRIEVANCE
Powered by Sarvam AI (Saaras v4 & Sarvam 105B)
Date: ${new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}
Detected Spoken Language: ${detectedLanguage}
===================================================================

CATEGORY:
${complaint.category}

SUBJECT:
${complaint.subject}

FORMAL COMPLAINT STATEMENT:
${complaint.description}

RECOMMENDED NEXT ACTIONS & FILING INSTRUCTIONS:
${complaint.suggestedNextAction}

-------------------------------------------------------------------
ORIGINAL CITIZEN VOICE TRANSCRIPT:
${originalTranscript}

ENGLISH TRANSLATION:
${translatedTranscript}
===================================================================
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Complaint_${complaint.category.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen px-4 py-8 md:py-12 max-w-5xl mx-auto flex flex-col justify-between">
      {/* Header */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full neu-card-sm text-xs font-semibold text-indigo-700 tracking-wide uppercase mb-4">
          <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
          Powered by Sarvam AI • Saaras v4 + Sarvam 105B
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-800 mb-3">
          Bhasha<span className="text-indigo-600">Bridge</span>
        </h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-medium">
          Speak Your Language, Be Understood. Convert spoken Indic grievances into authoritative,
          professionally drafted legal & civic complaints.
        </p>

        {/* Supported Languages Banner */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1 text-indigo-600 font-semibold">
            <Languages className="w-3.5 h-3.5" /> Supports 22+ Indian Languages:
          </span>
          <span className="bg-white/70 px-2 py-0.5 rounded-md shadow-sm border border-slate-200">हिंदी (Hindi)</span>
          <span className="bg-white/70 px-2 py-0.5 rounded-md shadow-sm border border-slate-200">मराठी (Marathi)</span>
          <span className="bg-white/70 px-2 py-0.5 rounded-md shadow-sm border border-slate-200">বাংলা (Bengali)</span>
          <span className="bg-white/70 px-2 py-0.5 rounded-md shadow-sm border border-slate-200">தமிழ் (Tamil)</span>
          <span className="bg-white/70 px-2 py-0.5 rounded-md shadow-sm border border-slate-200">తెలుగు (Telugu)</span>
          <span className="bg-white/70 px-2 py-0.5 rounded-md shadow-sm border border-slate-200">& More</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8">
        {/* Step 1: Input Container */}
        <div className="neu-card p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/60">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold">
                  1
                </span>
                Record or Upload Your Grievance
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Speak freely in your mother tongue about your civic, consumer, or service issue.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex neu-inset-sm p-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  setInputMode("record");
                  resetAll();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  inputMode === "record" ? "neu-pill-active" : "neu-pill-inactive"
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                Microphone
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputMode("upload");
                  resetAll();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  inputMode === "upload" ? "neu-pill-active" : "neu-pill-inactive"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Audio
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputMode("presets");
                  resetAll();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  inputMode === "presets" ? "neu-pill-active" : "neu-pill-inactive"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Demo Presets
              </button>
            </div>
          </div>

          {/* Mode 1: Microphone Recording */}
          {inputMode === "record" && (
            <div className="neu-inset p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
              {!audioBlob ? (
                <>
                  <div className="relative mb-5">
                    {isRecording && <div className="absolute inset-0 rounded-full recording-pulse bg-red-400" />}
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                        isRecording
                          ? "bg-red-500 text-white shadow-lg shadow-red-300 scale-105"
                          : "neu-btn text-indigo-600 hover:text-indigo-700"
                      }`}
                      title={isRecording ? "Stop Recording" : "Start Recording"}
                    >
                      {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
                    </button>
                  </div>

                  {isRecording ? (
                    <div>
                      <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-lg mb-1">
                        <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                        Recording: 00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime} / 00:30
                      </div>
                      <p className="text-xs text-slate-500">
                        Speak clearly in Hindi, Marathi, or any Indian language. Click square when done.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-1">Click the microphone to start speaking</h3>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Explain your problem (e.g. faulty electricity meter, delayed refund, damaged road). Max 30 seconds.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Recorded Audio Preview */
                <div className="w-full max-w-md flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">Voice Recording Captured!</h4>
                  <p className="text-xs text-slate-500 mb-4">Duration: ~{recordingTime}s • Ready for translation</p>

                  {audioUrl && (
                    <audio
                      ref={audioPlayerRef}
                      src={audioUrl}
                      onEnded={() => setIsPlayingAudio(false)}
                      className="hidden"
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleAudioPlay}
                      className="neu-btn px-4 py-2.5 rounded-xl text-xs font-semibold text-indigo-700 flex items-center gap-2"
                    >
                      {isPlayingAudio ? (
                        <>
                          <Pause className="w-4 h-4" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" /> Listen Audio
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={resetAll}
                      className="neu-btn px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1.5 hover:text-red-600"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Re-record
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: File Upload */}
          {inputMode === "upload" && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="neu-inset p-8 text-center flex flex-col items-center justify-center min-h-[220px] cursor-pointer hover:border-indigo-400 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm,.flac,.aac"
                onChange={handleFileUpload}
                className="hidden"
              />

              {!uploadedFile ? (
                <>
                  <div className="w-16 h-16 rounded-2xl neu-card-sm flex items-center justify-center text-indigo-600 mb-3">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">Drop your audio recording here</h3>
                  <p className="text-xs text-slate-500 mb-2">or click to browse from your computer / phone</p>
                  <p className="text-[11px] text-slate-400">
                    Supports WAV, MP3, M4A, OGG, WEBM, FLAC (Max 10MB, under 30s recommended)
                  </p>
                </>
              ) : (
                <div className="w-full max-w-md">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 truncate mb-1">{uploadedFile.name}</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Size: {(uploadedFile.size / 1024).toFixed(1)} KB • Type: {uploadedFile.type || "audio"}
                  </p>

                  {audioUrl && (
                    <audio
                      ref={audioPlayerRef}
                      src={audioUrl}
                      onEnded={() => setIsPlayingAudio(false)}
                      className="hidden"
                    />
                  )}

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAudioPlay();
                      }}
                      className="neu-btn px-4 py-2 rounded-xl text-xs font-semibold text-indigo-700 flex items-center gap-2"
                    >
                      {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlayingAudio ? "Pause" : "Play File"}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetAll();
                      }}
                      className="neu-btn px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 3: Demo Scenarios */}
          {inputMode === "presets" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SAMPLE_SCENARIOS.map((item, idx) => {
                const isSelected = selectedPresetText === item.text;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedPresetText(item.text)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all ${
                      isSelected ? "neu-inset border-2 border-indigo-500" : "neu-card-sm hover:translate-y-[-2px]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {item.language}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 font-bold" />}
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-indigo-600 font-medium mb-2">{item.subtitle}</p>
                    <p className="text-xs text-slate-600 line-clamp-3 italic">"{item.text}"</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Processing Notice</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Private & securely processed via Sarvam API Backend
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || (!audioBlob && !selectedPresetText)}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isLoading || (!audioBlob && !selectedPresetText)
                  ? "opacity-50 cursor-not-allowed neu-btn text-slate-400"
                  : "neu-btn-primary"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Complaint...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Formal Complaint
                </>
              )}
            </button>
          </div>

          {/* Loading Stepper */}
          {isLoading && (
            <div className="mt-8 pt-6 border-t border-slate-200/60">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 mb-1">
                  <span>AI Pipeline Processing</span>
                  <span>{loadingStep === 1 ? "25%" : loadingStep === 2 ? "60%" : "90%"}</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-700 ease-out"
                    style={{
                      width: loadingStep === 1 ? "30%" : loadingStep === 2 ? "65%" : "95%",
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 text-center gap-2 pt-2 text-xs">
                  <div
                    className={`${
                      loadingStep >= 1 ? "text-indigo-600 font-bold" : "text-slate-400"
                    } flex flex-col items-center gap-1`}
                  >
                    <span className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] bg-white">
                      1
                    </span>
                    <span>Ingesting Audio</span>
                  </div>
                  <div
                    className={`${
                      loadingStep >= 2 ? "text-indigo-600 font-bold" : "text-slate-400"
                    } flex flex-col items-center gap-1`}
                  >
                    <span className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] bg-white">
                      2
                    </span>
                    <span>Saaras v4 Translation</span>
                  </div>
                  <div
                    className={`${
                      loadingStep >= 3 ? "text-indigo-600 font-bold" : "text-slate-400"
                    } flex flex-col items-center gap-1`}
                  >
                    <span className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] bg-white">
                      3
                    </span>
                    <span>Sarvam 105B Drafting</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Output Container */}
        {result && (
          <div className="neu-card p-6 md:p-8 animate-in fade-in duration-500">
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                    {result.complaint.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    Detected: {result.detectedLanguage}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-800">Generated Official Complaint</h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `SUBJECT: ${result.complaint.subject}\n\nCATEGORY: ${result.complaint.category}\n\nDESCRIPTION:\n${result.complaint.description}\n\nSUGGESTED ACTION:\n${result.complaint.suggestedNextAction}`,
                      "all"
                    )
                  }
                  className="neu-btn px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-1.5 hover:bg-white"
                >
                  {copiedSection === "all" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy All
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={downloadComplaintTxt}
                  className="neu-btn px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:bg-white"
                >
                  <Download className="w-3.5 h-3.5" /> Download TXT
                </button>
              </div>
            </div>

            {/* View Switcher: Complaint Letter vs Original Transcripts */}
            <div className="flex neu-inset-sm p-1 gap-1 mb-6 max-w-sm">
              <button
                type="button"
                onClick={() => setActiveTab("complaint")}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "complaint" ? "neu-pill-active" : "neu-pill-inactive"
                }`}
              >
                Formal Grievance
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("transcripts")}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "transcripts" ? "neu-pill-active" : "neu-pill-inactive"
                }`}
              >
                Speech Transcripts
              </button>
            </div>

            {activeTab === "complaint" ? (
              <div className="space-y-6">
                {/* Subject Box */}
                <div className="neu-inset p-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Subject</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.complaint.subject, "subject")}
                      className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
                    >
                      {copiedSection === "subject" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-base font-bold text-slate-800 leading-snug">{result.complaint.subject}</p>
                </div>

                {/* Complaint Description Box */}
                <div className="neu-inset p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                      Formal Complaint Statement
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.complaint.description, "desc")}
                      className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
                    >
                      {copiedSection === "desc" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Statement
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line font-normal">
                    {result.complaint.description}
                  </div>
                </div>

                {/* Suggested Next Action */}
                <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-indigo-200">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
                        Recommended Next Action & Filing Channels
                      </h4>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(result.complaint.suggestedNextAction, "action")}
                        className="text-xs text-indigo-700 hover:underline flex items-center gap-1 font-semibold"
                      >
                        {copiedSection === "action" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-xs md:text-sm text-indigo-950/80 leading-relaxed">
                      {result.complaint.suggestedNextAction}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Transcripts View */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="neu-inset p-5">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-2">
                    Original Speech Transcript ({result.detectedLanguage})
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {result.originalTranscript}
                  </p>
                </div>

                <div className="neu-inset p-5">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-2">
                    Saaras v4 English Translation
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {result.translatedTranscript}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-14 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-600 mb-1">
          BhashaBridge • Designed for Indian Citizens, Municipalities & Consumer Grievances
        </p>
        <p>
          Utilizing Sarvam AI Saaras v4 (Speech-to-Text & Translation) and Sarvam-105B (Flagship Indic LLM) on Next.js.
        </p>
      </footer>
    </main>
  );
}
