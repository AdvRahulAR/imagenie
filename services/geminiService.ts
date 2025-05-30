import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn("API_KEY environment variable not found. Gemini API calls will fail.");
}

const IMAGE_MODEL_NAME = 'imagen-3.0-generate-002';
const TEXT_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';
const TTS_MODEL_NAME = 'gemini-2.5-flash-preview-tts';

export const generateImage = async (prompt: string): Promise<string> => {
  if (!genAI) {
    throw new Error("Gemini API client is not initialized. Is the API_KEY configured?");
  }

  try {
    const model = genAI.getGenerativeModel({ model: IMAGE_MODEL_NAME });
    const result = await model.generateImages({ prompt });

    if (!result.images?.[0]) {
      throw new Error("No image was generated");
    }

    const imageData = result.images[0];
    return URL.createObjectURL(new Blob([imageData.data], { type: imageData.mimeType }));
  } catch (error) {
    console.error('Error generating image:', error);
    if (error instanceof Error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the image.');
  }
};

export const generateContent = async (prompt: string): Promise<string> => {
  if (!genAI) {
    throw new Error("Gemini API client is not initialized. Is the API_KEY configured?");
  }

  try {
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL_NAME });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content:', error);
    if (error instanceof Error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the content.');
  }
};

export const generateVoice = async (text: string): Promise<ArrayBuffer> => {
  if (!genAI) {
    throw new Error("Gemini API client is not initialized. Is the API_KEY configured?");
  }

  try {
    const model = genAI.getGenerativeModel({ model: TTS_MODEL_NAME });
    const result = await model.generateSpeech(text, {
      voice: 'alloy',
      languageCode: 'en-US'
    });

    if (!result?.audioContent) {
      throw new Error("No audio data was generated");
    }

    return result.audioContent;
  } catch (error) {
    console.error('Error generating speech:', error);
    if (error instanceof Error) {
      throw new Error(`Speech generation error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating speech.');
  }
};

// Export these for backwards compatibility
export const voiceOptions = [
  { value: 'alloy', label: 'Alloy', characteristic: 'Neutral' },
  { value: 'echo', label: 'Echo', characteristic: 'Balanced' },
  { value: 'fable', label: 'Fable', characteristic: 'Authoritative' },
  { value: 'onyx', label: 'Onyx', characteristic: 'Professional' },
  { value: 'nova', label: 'Nova', characteristic: 'Warm' },
  { value: 'shimmer', label: 'Shimmer', characteristic: 'Clear' }
];

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

// Keep these for backwards compatibility
export const generateImageFromPrompt = generateImage;
export const generateStructuredContent = generateContent;
export const generateSpeech = async (
  text: string,
  voiceName: string = 'alloy',
  languageCode: string = 'en-US'
): Promise<string | null> => {
  try {
    const audioBuffer = await generateVoice(text);
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error in generateSpeech wrapper:', error);
    return null;
  }
};