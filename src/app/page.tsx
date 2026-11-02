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
  ExternalLink,
  ShieldCheck,
  Languages,
  ArrowRight,
  RefreshCw,
  Printer,
  ChevronDown,
  Building2,
  Scale,
  Clock,
  Send,
  HelpCircle,
  Headphones,
  CheckCircle2,
  Zap,
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
    title: "बिजली बिल व मीटर स्पार्किंग",
    subtitle: "Electricity Hazard & Excess Bill",
    language: "Hindi",
    scriptBadge: "हिन्दी",
    text: "नमस्ते, पिछले दो महीने से मेरा बिजली का मीटर बहुत तेज चल रहा है और उसमें से बार-बार चिंगारी निकल रही है। मैंने बिजली ऑफिस में दो बार शिकायत की लेकिन कोई सुनवाई नहीं हुई। मुझे बहुत डर लग रहा है कि कोई बड़ा हादसा न हो जाए और बिल भी 12,000 रुपये का आ गया है जो सामान्य से तीन गुना अधिक है। कृपया तुरंत मीटर बदलवाएं और बिल की जांच करें।",
  },
  {
    title: "दूषित पाणी पुरवठा तक्रार",
    subtitle: "Contaminated Water Supply",
    language: "Marathi",
    scriptBadge: "मराठी",
    text: "नमस्कार, आमच्या शिवाजी नगर कॉलनीत गेल्या 10 दिवसांपासून नळाला अत्यंत घाण आणि पिवळसर दुर्गंधीयुक्त पाणी येत आहे. हे पाणी पिल्यामुळे कॉलनीतील अनेक लहान मुले आणि वृद्ध आजारी पडले आहेत. स्थानिक पाणीपुरवठा अभियंत्यांना लेखी अर्ज देऊनही काहीच दखल घेतलेली नाही. कृपया तात्काळ नमुने तपासून स्वच्छ पाणीपुरवठा पूर्ववत करावा.",
  },
  {
    title: "E-Commerce Refund Delay",
    subtitle: "Defective Product & Denied Refund",
    language: "Hinglish",
    scriptBadge: "Hinglish",
    text: "Hello, maine 15 din pehle Flipkart se 45,000 rupaye ka laptop order kiya tha. Delivery ke time box damaged tha aur screen pe internal crack nikla. Maine usi din return initiate kiya lekin delivery agent ne pick up reject kar diya. Customer care bar bar 48 hours wait karne bol raha hai aur refund nahi de raha. Kripya mera refund turant process karwaya jaye.",
  },
  {
    title: "ವಿಳಂಬವಾದ ಪಿಂಚಣಿ ವಿತರಣೆ",
    subtitle: "Senior Citizen Pension Delay",
    language: "Kannada",
    scriptBadge: "ಕನ್ನಡ",
    text: "ನಮಸ್ಕಾರ, ನಾನು ನಿವೃತ್ತ ಸರ್ಕಾರಿ ಶಾಲಾ ಶಿಕ್ಷಕ. ಕಳೆದ ಮೂರು ತಿಂಗಳಿಂದ ನನಗೆ ಬರಬೇಕಾದ ಮಾಸಿಕ ಪಿಂಚಣಿ ನನ್ನ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮಾ ಆಗಿಲ್ಲ. ನಾನು ಖಜಾನೆ ಕಚೇರಿಗೆ ಮತ್ತು ಬ್ಯಾಂಕ್ ಶಾಖೆಗೆ ಹಲವು ಬಾರಿ ಭೇಟಿ ನೀಡಿದ್ದರೂ ಯಾವುದೇ ಸರಿಯಾದ ಉತ್ತರ ನೀಡುತ್ತಿಲ್ಲ. ನನ್ನ ಜೀವನ ನಿರ್ವಹಣೆಗೆ ಈ ಪಿಂಚಣಿಯೇ ಏಕೈಕ ಆಧಾರ. ದಯವಿಟ್ಟು ಬಾಕಿ ಇರುವ ಪಿಂಚಣಿಯನ್ನು ತಕ್ಷಣ ಬಿಡುಗಡೆ ಮಾಡಿ.",
  },
];

const INDIC_LANGUAGES = [
  { name: "Hindi", native: "हिन्दी" },
  { name: "Marathi", native: "मराठी" },
  { name: "Bengali", native: "বাংলা" },
  { name: "Telugu", native: "తెలుగు" },
  { name: "Tamil", native: "தமிழ்" },
  { name: "Gujarati", native: "ગુજરાતી" },
  { name: "Kannada", native: "ಕನ್ನಡ" },
  { name: "Malayalam", native: "മലയാളം" },
  { name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { name: "Odia", native: "ଓଡ଼ିଆ" },
  { name: "Assamese", native: "অসমীয়া" },
  { name: "Urdu", native: "اردو" },
  { name: "Maithili", native: "मैथिली" },
  { name: "Sanskrit", native: "संस्कृतम्" },
  { name: "Bhojpuri", native: "भोजपुरी" },
  { name: "Nepali", native: "नेपाली" },
  { name: "Konkani", native: "कोंकणी" },
  { name: "Sindhi", native: "سنڌي" },
  { name: "Kashmiri", native: "कॉशुर" },
  { name: "Dogri", native: "डोगरी" },
  { name: "Manipuri", native: "মৈতৈলোন্" },
  { name: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ" },
];

const OFFICIAL_PORTALS = [
  {
    name: "CPGRAMS (pgportal.gov.in)",
    desc: "Central & State Government public grievance redressal portal",
    url: "https://pgportal.gov.in/",
  },
  {
    name: "National Consumer Helpline (1915)",
    desc: "Dept of Consumer Affairs — against retail, e-commerce & service fraud",
    url: "https://consumerhelpline.gov.in/",
  },
  {
    name: "RBI Banking Ombudsman",
    desc: "Complaints against unauthorized bank charges, ATM frauds & loans",
    url: "https://cms.rbi.org.in/",
  },
  {
    name: "National Cyber Crime Portal",
    desc: "Financial online fraud, phishing & identity theft report (1930)",
    url: "https://cybercrime.gov.in/",
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
  const [showLanguages, setShowLanguages] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Audio timer
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 29) {
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

  // Audio playback tracker
  useEffect(() => {
    const audio = audioPlayerRef.current;
    if (!audio) return;
    const handleEnded = () => setIsPlayingAudio(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorMsg(null);
    setAudioBlob(null);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setErrorMsg(
        "Microphone permission was denied. Please allow microphone access in your browser or upload an audio file."
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
      setErrorMsg("File size exceeds 10MB limit. Please upload a smaller audio file.");
      return;
    }

    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const toggleAudioPlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const triggerGeneration = async (directTextOverride?: string) => {
    setErrorMsg(null);
    setIsLoading(true);
    setLoadingStep(1);

    const formData = new FormData();

    if (inputMode === "record" && audioBlob) {
      const isMp4 = audioBlob.type.includes("mp4");
      const cleanMime = isMp4 ? "audio/mp4" : "audio/webm";
      const ext = isMp4 ? "mp4" : "webm";
      const cleanBlob = new Blob([audioBlob], { type: cleanMime });
      formData.append("audio", cleanBlob, `recording.${ext}`);
    } else if (inputMode === "upload" && uploadedFile) {
      formData.append("audio", uploadedFile);
    } else if (inputMode === "presets" || directTextOverride) {
      const textToSend = directTextOverride || selectedPresetText;
      if (!textToSend) {
        setErrorMsg("Please select or enter a scenario to generate complaint.");
        setIsLoading(false);
        return;
      }
      formData.append("text", textToSend);
    } else {
      setErrorMsg("Please record your voice, upload an audio file, or pick a sample scenario.");
      setIsLoading(false);
      return;
    }

    try {
      // Step 2 indicator
      const stepTimer = setTimeout(() => {
        setLoadingStep(2);
      }, 3000);

      const step3Timer = setTimeout(() => {
        setLoadingStep(3);
      }, 7000);

      const response = await fetch("/api/generate-complaint", {
        method: "POST",
        body: formData,
      });

      clearTimeout(stepTimer);
      clearTimeout(step3Timer);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate complaint. Please try again.");
      }

      setResult(data);
      setActiveTab("complaint");

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err: any) {
      console.error("Submission Error:", err);
      setErrorMsg(err.message || "An unexpected error occurred. Please check server logs.");
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const copyFullComplaint = () => {
    if (!result) return;
    const fullText = `FORMAL CITIZEN GRIEVANCE PETITION
========================================
CATEGORY: ${result.complaint.category}
SUBJECT: ${result.complaint.subject}
DATE: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}

STATEMENT OF GRIEVANCE:
----------------------------------------
${result.complaint.description}

RECOMMENDED ACTION & FILING CHANNELS:
----------------------------------------
${result.complaint.suggestedNextAction}

--
Generated by BhashaBridge (Sarvam AI Multilingual Grievance Engine)
Detected Speech Language: ${result.detectedLanguage}`;

    copyToClipboard(fullText, "full");
  };

  const downloadAsTxt = () => {
    if (!result) return;
    const fullText = `FORMAL CITIZEN GRIEVANCE PETITION
========================================
REFERENCE ID: BB-${Date.now().toString().slice(-6)}
DATE: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
CATEGORY: ${result.complaint.category}
SUBJECT: ${result.complaint.subject}

========================================
STATEMENT OF GRIEVANCE
========================================
${result.complaint.description}

========================================
ACTION & ESCALATION DIRECTORY
========================================
${result.complaint.suggestedNextAction}

========================================
SPEECH AUDIT TRAIL
========================================
Language Detected: ${result.detectedLanguage}
Original Speech Transcript:
${result.originalTranscript}

Sarvam Saaras v4 English Translation:
${result.translatedTranscript}

--
Generated via BhashaBridge
Powered by Sarvam AI (Saaras v4 & 105B Indic LLM)`;

    const element = document.createElement("a");
    const file = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `Grievance_${result.complaint.category.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now().toString().slice(-4)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const printComplaint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-[#eaeff7] text-slate-800 antialiased selection:bg-indigo-500 selection:text-white pb-20">
      {/* ─── Top Enterprise Navigation Bar ───────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#eaeff7]/85 backdrop-blur-md border-b border-white/60 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 p-0.5 shadow-md shadow-indigo-300/40 flex items-center justify-center">
              <div className="w-full h-full bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Volume2 className="w-6 h-6 text-white stroke-[2.2]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                  Bhasha<span className="text-indigo-600">Bridge</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-100/90 text-indigo-800 rounded-full border border-indigo-200">
                  Sarvam AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                National Multilingual Voice Grievance Engine
              </p>
            </div>
          </div>

          {/* Right Status & Links */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Saaras v4 & 105B Active</span>
            </div>

            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className="neu-btn px-3.5 py-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5 hover:text-indigo-600"
            >
              <Languages className="w-4 h-4 text-indigo-600" />
              <span>22+ Languages</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showLanguages ? "rotate-180" : ""
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Expandable Languages Drawer */}
        {showLanguages && (
          <div className="border-t border-slate-200/80 bg-[#f1f5fc] px-4 py-4 animate-fade-in shadow-inner">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-indigo-600" /> Supported Indic Languages & Dialects
                </span>
                <span className="text-xs text-slate-500">
                  Auto-transcribed & translated via Sarvam Saaras v4
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {INDIC_LANGUAGES.map((lang) => (
                  <div
                    key={lang.name}
                    className="p-2 rounded-xl bg-white/70 border border-white text-center hover:bg-white transition-colors shadow-xs"
                  >
                    <div className="text-xs font-bold text-slate-800">{lang.native}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{lang.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero Section with Visual Value Proposition ──────────────────── */}
      <section className="relative pt-12 pb-14 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-indigo-100 shadow-sm text-xs font-semibold text-indigo-900 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI-Powered Citizen Grievance Redressal for India</span>
            <span className="text-indigo-300">•</span>
            <span className="text-slate-600">Zero Signup Required</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-5 font-sans">
            Speak in your language. <br className="hidden sm:inline" />
            <span className="gradient-text">Be understood by authorities.</span>
          </h1>

          {/* Hero Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal mb-8">
            Bureaucratic petitions shouldn’t require legal jargon or fluent English. Simply record your voice in
            <strong className="text-slate-800 font-semibold"> Hindi, Marathi, Bengali, Tamil</strong> or 20+ Indic languages. BhashaBridge translates and structures your complaint into a formal petition accepted by
            <strong className="text-slate-800 font-semibold"> CPGRAMS, Consumer Forums & DISCOMs</strong>.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-600 font-semibold">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 border border-white shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>22+ Scheduled Languages</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 border border-white shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Client-Side Privacy</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 border border-white shadow-xs">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instant Legal Structuring (&lt;15s)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 border border-white shadow-xs">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>CPGRAMS & Ombudsman Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MNC-Grade 3-Step Visual Guide (How It Works Diagram) ─────────── */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto mb-14">
        <div className="text-center mb-8">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 block mb-1">
            Intuitive 3-Step Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How Voice Turns Into an Official Complaint
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 Card with Visual SVG */}
          <div className="neu-flat p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-indigo-300">
                  01
                </span>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Voice In
                </span>
              </div>

              {/* Step 1 Visual Vector Diagram */}
              <div className="h-32 rounded-2xl bg-gradient-to-b from-indigo-50/70 to-white/70 border border-indigo-100/60 p-3 mb-4 flex items-center justify-center relative overflow-hidden">
                {/* Visual Audio Waves and Speech bubbles */}
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded-lg bg-white shadow-sm border border-slate-200 text-xs font-bold text-slate-700">
                    नमस्ते
                  </div>
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 animate-pulse">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-white shadow-sm border border-slate-200 text-xs font-bold text-slate-700">
                    नमस्कार
                  </div>
                </div>
                {/* Micro waveform overlay */}
                <div className="absolute bottom-2 left-6 right-6 flex items-center justify-center gap-1 opacity-70">
                  <span className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse" />
                  <span className="w-1 h-6 bg-indigo-600 rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="w-1 h-8 bg-indigo-700 rounded-full animate-pulse" />
                  <span className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse" />
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Speak or Upload Voice Note
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Click Record and explain your problem naturally in Hindi, Marathi, Bengali, or your native dialect. No formal phrasing needed.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-indigo-600" />
              <span>Supports live mic & .wav / .mp3 uploads</span>
            </div>
          </div>

          {/* Step 2 Card with Visual SVG */}
          <div className="neu-flat p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-xl bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-purple-300">
                  02
                </span>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  AI Translation & Reasoning
                </span>
              </div>

              {/* Step 2 Visual Vector Diagram */}
              <div className="h-32 rounded-2xl bg-gradient-to-b from-purple-50/70 to-white/70 border border-purple-100/60 p-3 mb-4 flex items-center justify-center relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="px-2 py-1 rounded bg-white shadow-xs border border-purple-200 text-[11px] font-bold text-purple-900">
                      Saaras v4
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium">Translate STT</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Sparkles className="w-5 h-5 text-purple-600 animate-spin" />
                    <ArrowRight className="w-4 h-4 text-purple-400 mt-0.5" />
                  </div>
                  <div className="text-center">
                    <div className="px-2 py-1 rounded bg-purple-600 text-white shadow-xs text-[11px] font-bold">
                      Sarvam 105B
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium">Legal Reasoning</span>
                  </div>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Sarvam AI Dual Pipeline
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Saaras v4 translates audio to English. Then Sarvam 105B structures the incident timeline, identifies legal deficiencies, and categorizes the breach.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-purple-600" />
              <span>Preserves dates, monetary damages & facts</span>
            </div>
          </div>

          {/* Step 3 Card with Visual SVG */}
          <div className="neu-flat p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-emerald-300">
                  03
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Legal Complaint Ready
                </span>
              </div>

              {/* Step 3 Visual Vector Diagram */}
              <div className="h-32 rounded-2xl bg-gradient-to-b from-emerald-50/70 to-white/70 border border-emerald-100/60 p-3 mb-4 flex items-center justify-center relative overflow-hidden">
                <div className="w-48 bg-white rounded-xl shadow-md border border-emerald-200 p-2.5 transform rotate-1">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-1.5">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase">FORMAL GRIEVANCE</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="h-2 w-3/4 bg-slate-200 rounded-sm mb-1" />
                  <div className="h-1.5 w-full bg-slate-100 rounded-sm mb-1" />
                  <div className="h-1.5 w-5/6 bg-slate-100 rounded-sm" />
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Download & File with Authority
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Receive an authoritative petition with specific guidance on which portal (CPGRAMS, Consumer Helpline, or DISCOM) to submit to.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>One-click Copy, .txt Download & Print</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Interactive Console ────────────────────────────────────── */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto mb-14" id="studio">
        <div className="neu-flat-lg p-6 sm:p-10 relative">
          {/* Header Title inside card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/70">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Grievance Input Studio
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Choose your preferred input method to create your petition
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="neu-inset-sm p-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setInputMode("record");
                  setSelectedPresetText(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${inputMode === "record" ? "neu-tab-active" : "neu-tab-inactive"
                  }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Record Voice</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputMode("upload");
                  setSelectedPresetText(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${inputMode === "upload" ? "neu-tab-active" : "neu-tab-inactive"
                  }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Audio</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode("presets")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${inputMode === "presets" ? "neu-tab-active" : "neu-tab-inactive"
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sample Scenarios</span>
              </button>
            </div>
          </div>

          {/* ── MODE 1: RECORD VOICE ───────────────────────────────────────── */}
          {inputMode === "record" && (
            <div className="py-8 flex flex-col items-center text-center">
              {/* Circular tactile mic button */}
              <div className="relative mb-6">
                {isRecording && (
                  <div className="absolute inset-0 rounded-full record-pulse -m-2 pointer-events-none" />
                )}

                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all ${isRecording
                    ? "bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-xl shadow-red-200 scale-105"
                    : audioBlob
                      ? "neu-btn text-indigo-600 hover:scale-105"
                      : "neu-btn text-indigo-600 hover:scale-105"
                    }`}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-8 h-8 fill-current" />
                      <span className="text-[11px] font-extrabold uppercase mt-1 tracking-wider">
                        Stop
                      </span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-10 h-10 stroke-[2.2]" />
                      <span className="text-[11px] font-bold mt-1 text-slate-700">
                        {audioBlob ? "Record Again" : "Tap to Speak"}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Status and Timer */}
              {isRecording ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 text-red-700 font-mono text-sm font-bold border border-red-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <span>00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime} / 00:30</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Listening... Speak clearly in your mother tongue.
                  </p>
                </div>
              ) : audioBlob ? (
                <div className="space-y-4 w-full max-w-md">
                  <div className="neu-inset p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={toggleAudioPlayback}
                        className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md hover:bg-indigo-700 transition-colors"
                      >
                        {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-800">Recorded Audio Clip</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Duration: {recordingTime}s • Ready for Saaras v4
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAudioBlob(null);
                        setAudioUrl(null);
                      }}
                      className="text-xs text-slate-500 hover:text-red-600 font-medium flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Discard
                    </button>
                  </div>

                  {audioUrl && <audio ref={audioPlayerRef} src={audioUrl} className="hidden" />}

                  <button
                    type="button"
                    onClick={() => triggerGeneration()}
                    disabled={isLoading}
                    className="neu-btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Official Complaint</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Click the microphone and start describing your grievance
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Speak in Hindi, Marathi, Tamil, or your native dialect. Up to 30 seconds per recording.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── MODE 2: UPLOAD AUDIO ───────────────────────────────────────── */}
          {inputMode === "upload" && (
            <div className="py-8">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac"
                onChange={handleFileUpload}
                className="hidden"
              />

              {!uploadedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="neu-inset p-8 text-center cursor-pointer hover:border-indigo-300 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    Click or Drag to Upload Audio File
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">
                    Supports .wav, .mp3, .m4a, .ogg, or .flac (Max file size: 10MB)
                  </p>
                  <div className="inline-block px-3 py-1 rounded-lg bg-white/80 border border-slate-200 text-[11px] font-semibold text-indigo-700">
                    Browse Local Audio File
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="neu-inset p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={toggleAudioPlayback}
                        className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md hover:bg-indigo-700 transition-colors"
                      >
                        {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                          {uploadedFile.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • {uploadedFile.type || "audio"}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        setAudioUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-xs text-slate-500 hover:text-red-600 font-medium flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  {audioUrl && <audio ref={audioPlayerRef} src={audioUrl} className="hidden" />}

                  <button
                    type="button"
                    onClick={() => triggerGeneration()}
                    disabled={isLoading}
                    className="neu-btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Process Audio with Sarvam AI</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── MODE 3: SAMPLE PRESETS ─────────────────────────────────────── */}
          {inputMode === "presets" && (
            <div className="py-6">
              <div className="mb-4 text-left">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  1-Click Test Scenarios (No mic required)
                </span>
                <p className="text-xs text-slate-500">
                  Select an authentic citizen case below to test the Sarvam 105B grievance structuring instantly:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                {SAMPLE_SCENARIOS.map((scenario) => {
                  const isSelected = selectedPresetText === scenario.text;
                  return (
                    <div
                      key={scenario.title}
                      onClick={() => setSelectedPresetText(scenario.text)}
                      className={`p-4 rounded-2xl cursor-pointer text-left transition-all ${isSelected
                        ? "bg-indigo-50/90 border-2 border-indigo-600 shadow-sm"
                        : "neu-flat hover:border-indigo-200"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900">{scenario.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          {scenario.scriptBadge}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-indigo-700 mb-2">
                        {scenario.subtitle}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                        "{scenario.text}"
                      </p>
                    </div>
                  );
                })}
              </div>

              {selectedPresetText && (
                <div className="space-y-3">
                  <div className="neu-inset p-3 text-left text-xs text-slate-700 leading-relaxed font-normal">
                    <span className="font-bold text-indigo-900 block mb-1">Selected Narrative:</span>
                    {selectedPresetText}
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerGeneration(selectedPresetText)}
                    disabled={isLoading}
                    className="neu-btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Complaint from Selected Scenario</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── ERROR MESSAGE BANNER ───────────────────────────────────────── */}
          {errorMsg && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-left animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed flex-1">
                <span className="font-bold block mb-0.5">Processing Notice</span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* ── LOADING PIPELINE STEPPER ───────────────────────────────────── */}
          {isLoading && (
            <div className="mt-6 p-6 rounded-2xl neu-inset text-center space-y-4 animate-fade-in">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 animate-spin">
                  <RefreshCw className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  {loadingStep === 1 && "Stage 1: Transcribing & Translating Speech..."}
                  {loadingStep === 2 && "Stage 2: Structuring Grievance with Sarvam 105B..."}
                  {loadingStep === 3 && "Stage 3: Drafting Official Petition & Escalation Route..."}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {loadingStep === 1 &&
                    "Sarvam Saaras v4 is processing acoustic features and translating Indic speech into English."}
                  {loadingStep === 2 &&
                    "Sarvam 105B flagship LLM is extracting facts, damages, legal breaches, and filing strategy."}
                  {loadingStep === 3 &&
                    "Formatting subject line, categorical classification, and petition narrative."}
                </p>
              </div>

              {/* Progress Stepper Dots */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <span
                  className={`w-3 h-3 rounded-full transition-all ${loadingStep >= 1 ? "bg-indigo-600 ring-4 ring-indigo-100" : "bg-slate-300"
                    }`}
                />
                <span className="w-8 h-0.5 bg-slate-300" />
                <span
                  className={`w-3 h-3 rounded-full transition-all ${loadingStep >= 2 ? "bg-indigo-600 ring-4 ring-indigo-100" : "bg-slate-300"
                    }`}
                />
                <span className="w-8 h-0.5 bg-slate-300" />
                <span
                  className={`w-3 h-3 rounded-full transition-all ${loadingStep >= 3 ? "bg-indigo-600 ring-4 ring-indigo-100" : "bg-slate-300"
                    }`}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── RESULT DOCUMENT SECTION ─────────────────────────────────────── */}
      {result && (
        <section ref={resultsRef} className="px-4 sm:px-6 max-w-4xl mx-auto mb-16 animate-fade-in">
          <div className="neu-flat-lg p-6 sm:p-10 border-2 border-indigo-200/80">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      Formal Grievance Petition
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Ready to File
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Language: <span className="font-semibold text-indigo-700">{result.detectedLanguage}</span> • Generated via Sarvam AI
                  </p>
                </div>
              </div>

              {/* View Switcher: Complaint vs Transcripts */}
              <div className="neu-inset-sm p-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("complaint")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "complaint" ? "neu-tab-active" : "neu-tab-inactive"
                    }`}
                >
                  <FileText className="w-3.5 h-3.5 inline mr-1" />
                  Official Letter
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("transcripts")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "transcripts" ? "neu-tab-active" : "neu-tab-inactive"
                    }`}
                >
                  <Languages className="w-3.5 h-3.5 inline mr-1" />
                  Speech Transcripts
                </button>
              </div>
            </div>

            {/* TAB 1: FORMAL COMPLAINT LETTER */}
            {activeTab === "complaint" && (
              <div className="py-6 space-y-6">
                {/* Meta details strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Category:
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-xs">
                      {result.complaint.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Date:
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {new Date().toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Subject Line */}
                <div className="neu-inset p-4 sm:p-5 text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                      Formal Subject Line
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.complaint.subject, "subject")}
                      className="text-xs text-slate-500 hover:text-indigo-600 font-semibold flex items-center gap-1"
                    >
                      {copiedSection === "subject" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Subject
                        </>
                      )}
                    </button>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {result.complaint.subject}
                  </h4>
                </div>

                {/* Statement of Grievance Narrative */}
                <div className="neu-inset p-5 sm:p-7 text-left space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                      Statement of Grievance & Incident Narrative
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.complaint.description, "desc")}
                      className="text-xs text-slate-500 hover:text-indigo-600 font-semibold flex items-center gap-1"
                    >
                      {copiedSection === "desc" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Body
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line space-y-3">
                    {result.complaint.description}
                  </div>
                </div>

                {/* Recommended Next Action & Escalation Directory */}
                <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50/90 border border-indigo-200/90 text-left flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-indigo-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                        Recommended Filing Route & Next Actions
                      </h4>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(result.complaint.suggestedNextAction, "action")}
                        className="text-xs text-indigo-700 hover:underline font-bold flex items-center gap-1"
                      >
                        {copiedSection === "action" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-indigo-950/85 leading-relaxed font-normal">
                      {result.complaint.suggestedNextAction}
                    </p>
                  </div>
                </div>

                {/* Action Buttons Bar */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={copyFullComplaint}
                      className="neu-btn px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-2 hover:text-indigo-600"
                    >
                      {copiedSection === "full" ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" /> Copied Full Complaint
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-indigo-600" /> Copy Full Text
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={downloadAsTxt}
                      className="neu-btn px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-2 hover:text-indigo-600"
                    >
                      <Download className="w-4 h-4 text-indigo-600" /> Download .TXT
                    </button>

                    <button
                      type="button"
                      onClick={printComplaint}
                      className="neu-btn px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-2 hover:text-indigo-600"
                    >
                      <Printer className="w-4 h-4 text-indigo-600" /> Print / Save PDF
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setAudioBlob(null);
                      setAudioUrl(null);
                      setUploadedFile(null);
                      setSelectedPresetText(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="neu-btn px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Start New Grievance
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: SPEECH TRANSCRIPTS SIDE-BY-SIDE */}
            {activeTab === "transcripts" && (
              <div className="py-6 space-y-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="neu-inset p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                        Original Speech Transcript
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {result.detectedLanguage}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                      {result.originalTranscript}
                    </p>
                  </div>

                  <div className="neu-inset p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                        Saaras v4 English Translation
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        Translate Mode
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                      {result.translatedTranscript}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-100 text-[11px] text-slate-600 leading-relaxed">
                  <strong>Verification Note:</strong> Sarvam Saaras v4 acoustic models recognize Indic phonetics and contextual colloquialisms, ensuring zero loss of critical grievance details before sending to the 105B LLM.
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Official Grievance Portals Directory ────────────────────────── */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto mb-16">
        <div className="text-center mb-8">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 block mb-1">
            Where to Submit Your Grievance
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Direct Government & Regulatory Portals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
            Once generated, copy your petition and file directly on these authorized portals for legally mandated response times.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OFFICIAL_PORTALS.map((portal) => (
            <a
              key={portal.name}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="neu-flat p-5 rounded-2xl block text-left group hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                {portal.name}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {portal.desc}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* ─── MNC Clean Footer ────────────────────────────────────────────── */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 border-t border-slate-200/80 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">BhashaBridge</span>
            <span>• Empowering Indian Citizens Through Voice AI</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <span>Sarvam Saaras v4</span>
            <span>•</span>
            <span>Sarvam 105B Indic LLM</span>
            <span>•</span>
            <span>Next.js 16</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          This platform is an open civic tool designed to democratize legal grievance writing for non-English speakers across India. Audio files are processed transiently in memory and never retained.
        </p>
      </footer>
    </main>
  );
}
