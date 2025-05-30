import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let ai: GoogleGenerativeAI | null = null;

if (API_KEY) {
  ai = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn("API_KEY environment variable not found. Gemini API calls will fail.");
}

const TEXT_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';
const TTS_MODEL_NAME = 'gemini-2.5-flash-preview-tts';
const IMAGEN_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/imagen-3.0-generate-002:generateImages';

// Voice options with their characteristics
export const voiceOptions = [
  { value: 'alloy', label: 'Alloy', characteristic: 'Neutral' },
  { value: 'echo', label: 'Echo', characteristic: 'Balanced' },
  { value: 'fable', label: 'Fable', characteristic: 'Authoritative' },
  { value: 'onyx', label: 'Onyx', characteristic: 'Professional' },
  { value: 'nova', label: 'Nova', characteristic: 'Warm' },
  { value: 'shimmer', label: 'Shimmer', characteristic: 'Clear' }
];

// Supported languages with their BCP-47 codes
export const supportedLanguages = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'it-IT', name: 'Italian (Italy)' },
  { code: 'ja-JP', name: 'Japanese (Japan)' },
  { code: 'ko-KR', name: 'Korean (Korea)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' }
];

export const imageStyles = [
  { value: "", label: "Default (No Style)" },
  { value: "Animated", label: "Animated" },
  { value: "Ghibli Studio Style", label: "Ghibli Studio" },
  { value: "Realistic", label: "Realistic" },
  { value: "Photorealistic", label: "Photorealistic" },
  { value: "DSLR Photo", label: "DSLR Photo" },
  { value: "Pixel Art", label: "Pixel Art" },
  { value: "Fantasy Art", label: "Fantasy Art" },
  { value: "Sci-Fi Art", label: "Sci-Fi Art" },
  { value: "Impressionist Painting", label: "Impressionist Painting" },
  { value: "Watercolor Painting", label: "Watercolor Painting" },
  { value: "Low Poly", label: "Low Poly" },
  { value: "Line Art", label: "Line Art" },
  { value: "Concept Art", label: "Concept Art" },
  { value: "Vintage Photo", label: "Vintage Photo" },
  { value: "Synthwave", label: "Synthwave" },
  { value: "Steampunk", label: "Steampunk" }
];

interface GeneratedMediaData {
  url: string;
  mimeType: string;
}

export const generateImageFromPrompt = async (
  prompt: string,
  optimize: boolean = false,
  style: string = ""
): Promise<GeneratedMediaData[] | null> => {
  if (!API_KEY) {
    throw new Error("API key is not configured. Is the API_KEY configured?");
  }

  let finalPrompt = prompt.trim();
  if (style) {
    finalPrompt = `${finalPrompt}, in a ${style} style`;
  }

  try {
    const response = await fetch(`${IMAGEN_API_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          text: finalPrompt
        },
        parameters: {
          sampleCount: 4,
          dimension: {
            width: 1024,
            height: 1024
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate images');
    }

    const data = await response.json();
    
    if (!data.images || data.images.length === 0) {
      throw new Error("No images were generated");
    }

    return data.images.map((image: { bytes: string }) => ({
      url: `data:image/png;base64,${image.bytes}`,
      mimeType: 'image/png'
    }));
  } catch (error) {
    console.error('Error generating images:', error);
    if (error instanceof Error) {
      throw new Error(`Image generation error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating images.');
  }
};

export const generateStructuredContent = async (
  userInput: string,
  contentType: string
): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini API client is not initialized. Is the API_KEY configured?");
  }

  try {
    const model = ai.getGenerativeModel({ model: TEXT_MODEL_NAME });
    const result = await model.generateText({
      text: userInput,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    if (!result.text) {
      throw new Error("No content was generated");
    }

    return result.text;
  } catch (error) {
    console.error('Error generating content:', error);
    if (error instanceof Error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating content.');
  }
};

export const generateSpeech = async (
  text: string,
  voiceName: string = 'alloy',
  languageCode: string = 'en-US'
): Promise<string | null> => {
  if (!ai) {
    throw new Error("Gemini API client is not initialized. Is the API_KEY configured?");
  }

  try {
    const model = ai.getGenerativeModel({ model: TTS_MODEL_NAME });
    const result = await model.generateSpeech({
      text,
      voice: voiceName,
      languageCode
    });

    if (!result?.audioContent) {
      throw new Error("No audio data was generated");
    }

    const audioBlob = new Blob([result.audioContent], { type: 'audio/wav' });
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error generating speech:', error);
    if (error instanceof Error) {
      throw new Error(`Speech generation error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating speech.');
  }
};