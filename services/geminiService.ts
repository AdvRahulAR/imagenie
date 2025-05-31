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
  if (!ai) {
    throw new Error("Gemini API client is not initialized. Is the API_KEY configured?");
  }

  let finalPrompt = prompt.trim();
  if (style) {
    finalPrompt = `${finalPrompt}, in a ${style} style`;
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-pro-vision" });
    const result = await model.generateImages({
      prompt: finalPrompt,
      n: 4,
      size: "1024x1024"
    });

    if (!result.images || result.images.length === 0) {
      throw new Error("No images were generated");
    }

    return result.images.map(image => ({
      url: image.url,
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
    const result = await model.generateText(userInput);

    if (!result.text) {
      throw new Error("No content was generated");
    }

    return result.text;
  } catch (error) {
    console.error('Error generating content:', error);
    if (error instanceof Error) {
      throw new Error(`Content generation error: ${error.message}`);
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
    const result = await model.generateSpeech(text, {
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