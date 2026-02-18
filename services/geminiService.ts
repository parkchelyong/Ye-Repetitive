
import { GoogleGenAI, Type } from "@google/genai";
import { PolicyAnalysis, HistoryEntry } from "../types";

export const analyzeVideoFrames = async (
  framesBase64: string[], 
  history: HistoryEntry[]
): Promise<PolicyAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const hasHistory = history.length > 0;
  // Create a context of past signatures for comparison
  const historyContext = hasHistory 
    ? history.map((h, i) => `[ID_${i + 1}] Visual Fingerprint: ${h.visualSignature}`).join('\n')
    : "DATABASE_IS_EMPTY. This is the first video.";

  const systemInstruction = `
    You are a professional YouTube Content Policy Expert. Your goal is to prevent "Repetitive Content" (ထပ်တလဲလဲဖြစ်သော အကြောင်းအရာများ) violations for a Dharma channel.
    
    POLICY RULES:
    1. Repetitive content is content that is visually indistinguishable from other videos on the same channel.
    2. Using the same AI-generated video (Veo 3) multiple times with only minor audio changes is a violation.
    3. You must look for similar backgrounds, monk/statue figures, lighting, and camera movements.

    YOUR TASKS:
    1. Analyze the 4 provided frames from the NEW video.
    2. Generate a detailed "visualSignature": Describe the subject, background, color palette, and composition.
    3. COMPARE the new signature against the provided history [ID_1, ID_2, ...].
    4. Provide a judgment:
       - If it's too similar to any past ID: status = "High Risk", isRepetitive = true, historyCheck.isSimilarToPast = true.
       - If it's distinct: status = "Safe", isRepetitive = false, historyCheck.isSimilarToPast = false.

    EXPLANATION REQUIREMENTS (In Burmese):
    - If SAFE: "တင်ရန်သင့်တော်ပါသည်။ အကြောင်းရင်းမှာ... [Policy-based reasoning: e.g., Different background, unique subject position, etc.]"
    - If REPETITIVE: "မတင်သင့်ပါ။ အကြောင်းရင်းမှာ... [Detailed reason: e.g., Matches ID_X exactly in lighting and subject.]"
    - Always explain the logic behind "Repetitive Content Policy" (ထပ်တလဲလဲဖြစ်သော အကြောင်းအရာများ မူဝါဒ).

    HISTORY DATABASE:
    ${historyContext}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: "YouTube Repetitive Content Policy နဲ့အညီ စစ်ဆေးပေးပါ။ အရင်တင်ထားဖူးတဲ့ ID တွေနဲ့ တူနေရင် ဘယ် ID နဲ့တူလဲဆိုတာ ပြောပါ။ မတူရင်လည်း ဘာလို့ မတူတာလဲ (Safe ဖြစ်တာလဲ) ဆိုတာကို အသေးစိတ် ရှင်းပြပေးပါ။" },
        ...framesBase64.map(data => ({ inlineData: { mimeType: 'image/jpeg', data } }))
      ]
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          similarityScore: { type: Type.NUMBER, description: "Confidence score (0-100) of the most similar match." },
          isRepetitive: { type: Type.BOOLEAN },
          status: { type: Type.STRING, enum: ["Safe", "Warning", "High Risk"] },
          policyViolations: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.STRING, description: "Detailed Burmese explanation of why it passed or failed policy." },
          visualSignature: { type: Type.STRING, description: "A technical description of the visual features." },
          comparisonDetails: {
            type: Type.OBJECT,
            properties: {
              composition: { type: Type.STRING },
              colors: { type: Type.STRING },
              subjectMatter: { type: Type.STRING },
              motionAnalysis: { type: Type.STRING }
            },
            required: ["composition", "colors", "subjectMatter", "motionAnalysis"]
          },
          historyCheck: {
            type: Type.OBJECT,
            properties: {
              isSimilarToPast: { type: Type.BOOLEAN },
              matchedVideoIndex: { type: Type.NUMBER, description: "The X index from [ID_X] that matched (1-based)." },
              details: { type: Type.STRING, description: "Specific Burmese comparison against the matched ID." }
            },
            required: ["isSimilarToPast", "details"]
          }
        },
        required: ["similarityScore", "isRepetitive", "status", "policyViolations", "recommendations", "visualSignature", "comparisonDetails", "historyCheck"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as PolicyAnalysis;
};

export const extractFramesFromVideo = (file: File): Promise<{ frames: string[], thumbnail: string }> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: string[] = [];
    let thumbnail = '';
    
    video.src = URL.createObjectURL(file);
    video.muted = true;
    
    video.onloadedmetadata = async () => {
      const duration = video.duration || 8;
      // Capture 4 representative frames
      const times = [0.1, duration * 0.4, duration * 0.7, duration * 0.9];
      
      for (let i = 0; i < times.length; i++) {
        video.currentTime = times[i];
        await new Promise(r => { video.onseeked = r; });
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
        
        // Quality balanced for Gemini
        const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        frames.push(base64);
        
        // Thumbnail generation for history display
        if (i === 1) {
          const thumbCanvas = document.createElement('canvas');
          const thumbCtx = thumbCanvas.getContext('2d');
          const scale = 480 / video.videoWidth;
          thumbCanvas.width = 480;
          thumbCanvas.height = video.videoHeight * scale;
          thumbCtx?.drawImage(video, 0, 0, thumbCanvas.width, thumbCanvas.height);
          thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.5);
        }
      }
      resolve({ frames, thumbnail });
    };
  });
};
