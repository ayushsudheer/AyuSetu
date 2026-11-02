# BhashaBridge – Speak Your Language, Be Understood, Complain 

**BhashaBridge** is an AI-powered multilingual voice-to-complaint generator designed for Indian citizens. It empowers users to speak about civic, utility, or consumer grievances in their native tongue (Hindi, Marathi, Bengali, Tamil, Telugu, and 20+ Indic languages) and automatically transforms their spoken words into formal, highly structured, and actionable complaint letters ready for official submission.

---

## 🌟 Key Features

1. **Microphone Voice Recording & File Upload**
   - Direct in-browser microphone recording with live visual timer and audio playback preview.
   - Drag-and-drop audio uploader supporting `.wav`, `.mp3`, `.m4a`, `.ogg`, `.webm`, and `.flac`.
   - 1-Click Interactive Demo Scenarios for instant evaluation without requiring a microphone.

2. **Sarvam Saaras v4 (Speech-to-Text & Translation)**
   - Utilizes Sarvam's flagship `saaras:v4` model in `translate` mode to translate spoken Indic speech into English.
   - Automatic language detection with confidence scoring across 22+ Indian languages.
   - Displays both original spoken transcript and English translated transcript.

3. **Sarvam 105B Flagship LLM Complaint Structuring**
   - Transforms unstructured, conversational complaints into formal legal/civic grievances containing:
     - **Formal Subject Line**
     - **Standard Complaint Category** (e.g. *Electricity & Power*, *Water Supply & Sewage*, *Consumer Protection*)
     - **Detailed Grievance Narrative** with incident timeline and impact
     - **Suggested Next Action & Filing Channels** (e.g. CPGRAMS, National Consumer Helpline 1915, DISCOM CGRF, Banking Ombudsman)

4. **Modern Neumorphism (Soft UI) Design**
   - Clean, light background with dual extruded soft drop-shadows and inset well panels.
   - Polished typography using *Inter* and *Plus Jakarta Sans*.
   - Responsive layouts optimized for desktop, tablets, and smartphones.

5. **Export & Sharing Tools**
   - One-click copy for the entire complaint or individual sections.
   - Instant `.txt` document download formatted for official government portal uploads.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ / 15 (App Router with TypeScript)
- **Styling**: Tailwind CSS with custom Neumorphic design tokens
- **AI SDK**: Official `sarvamai` JavaScript SDK
- **Icons**: Lucide React
- **Backend**: Secure Next.js Server Route Handlers (`/api/generate-complaint`) ensuring zero client-side exposure of API keys

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.17+ or Node.js 20+
- A valid Sarvam AI API key from [Sarvam AI Dashboard](https://indus.sarvam.ai/key-management)

### 2. Installation

Clone or open the repository:
```bash
git clone https://github.com/ayushsudheer/AyuSetu.git
cd AyuSetu
```

Install dependencies:
```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Add your Sarvam AI API key:
```env
SARVAM_API_KEY=your_sarvam_api_key_here
```

> **Security Note:** `.env` and `.env.local` are included in `.gitignore` and are never committed to version control.

### 4. Running Locally

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deploying to Vercel

1. Push this project to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: BhashaBridge multilingual voice complaint generator"
   git branch -M main
   git remote add origin https://github.com/ayushsudheer/AyuSetu.git
   git push -u origin main
   ```

2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import the `AyuSetu` repository.
4. Under **Environment Variables**, add:
   - **Key**: `SARVAM_API_KEY`
   - **Value**: `sk_r••••••••••••••••••••`
5. Click **Deploy**. Vercel will build and deploy your Next.js application automatically!

---

## 📄 License
MIT License. Built with Sarvam AI.
