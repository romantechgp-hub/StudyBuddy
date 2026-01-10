
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StudyExplanation, MathSolution } from "../types";

const API_KEY = process.env.API_KEY || '';

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

/**
 * Easy Study Mode Explanation
 */
export async function getStudyExplanation(topic: string, imageData?: string): Promise<StudyExplanation> {
  const ai = getGeminiClient();
  const model = 'gemini-3-flash-preview';

  const prompt = `
    You are a friendly StudyBuddy. Explain the following topic to a student.
    Topic: ${topic}
    
    Provide the response in the following JSON format:
    {
      "bengali": "A very simple explanation in Bengali using easy words.",
      "english": "The same explanation in simple English.",
      "story": "A small relatable story or analogy to help remember the concept.",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }
    
    If an image is provided, analyze the text/diagram in the image first.
    Be encouraging and supportive like a friend, not a strict teacher.
  `;

  const contents: any[] = [{ text: prompt }];
  if (imageData) {
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageData.split(',')[1] || imageData
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bengali: { type: Type.STRING },
          english: { type: Type.STRING },
          story: { type: Type.STRING },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["bengali", "english", "story", "keyPoints"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

/**
 * Math Solver
 */
export async function solveMathProblem(problem: string, imageData?: string): Promise<MathSolution> {
  const ai = getGeminiClient();
  // Using Pro for better mathematical reasoning
  const model = 'gemini-3-pro-preview';

  const prompt = `
    Solve this math problem step-by-step. 
    Explain each step simply in Bengali so a student can understand 'why' we do it.
    Problem: ${problem}

    Provide the response in the following JSON format:
    {
      "steps": ["Step 1 description in Bengali", "Step 2 description in Bengali", "..."],
      "finalAnswer": "The final result (bold)",
      "concept": "A brief explanation of the underlying mathematical concept in Bengali."
    }
    
    If an image is provided, extract the math problem from it first.
  `;

  const contents: any[] = [{ text: prompt }];
  if (imageData) {
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageData.split(',')[1] || imageData
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          finalAnswer: { type: Type.STRING },
          concept: { type: Type.STRING }
        },
        required: ["steps", "finalAnswer", "concept"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

/**
 * Speaking Helper Translation
 */
export async function translateAndGuide(text: string): Promise<{english: string, guide: string}> {
  const ai = getGeminiClient();
  const model = 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model,
    contents: `Translate this Bengali sentence into simple natural English for speaking practice. Also provide a simple Bengali pronunciation guide.
    Sentence: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          english: { type: Type.STRING, description: "Correct natural English translation" },
          guide: { type: Type.STRING, description: "Simple Bengali pronunciation guide" }
        },
        required: ["english", "guide"]
      }
    }
  });

  return JSON.parse(response.text || '{"english": "", "guide": ""}');
}

/**
 * Audio helper functions
 */
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
