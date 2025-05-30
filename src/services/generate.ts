import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY environment variable is not configured");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const IMAGE_MODEL = "imagen-3.0-generate-002";
const TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

/**
 * Generates an image from a text prompt using Gemini's Imagen model
 * @param prompt Descriptive text prompt for image generation
 * @returns Promise resolving to the generated image URL
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: IMAGE_MODEL });
    const result = await model.generateImages({ prompt });
    
    if (!result.images?.[0]) {
      throw new Error("No image was generated");
    }

    // Create a URL for the generated image
    const imageBlob = new Blob([result.images[0].data], { 
      type: result.images[0].mimeType 
    });
    return URL.createObjectURL(imageBlob);
  } catch (error) {
    console.error("Image generation failed:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate image");
  }
}

/**
 * Generates text content using Gemini's text model
 * @param prompt Content generation prompt
 * @returns Promise resolving to the generated text content
 */
export async function generateContent(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("No content was generated");
    }
    
    return text;
  } catch (error) {
    console.error("Content generation failed:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate content");
  }
}

/**
 * Generates speech audio from text using Gemini's text-to-speech model
 * @param text Text to convert to speech
 * @returns Promise resolving to audio data as ArrayBuffer
 */
export async function generateVoice(text: string): Promise<ArrayBuffer> {
  try {
    const model = genAI.getGenerativeModel({ model: TTS_MODEL });
    const result = await model.generateSpeech(text, {
      voice: "alloy",
      languageCode: "en-US"
    });
    
    if (!result.audioContent) {
      throw new Error("No audio was generated");
    }
    
    return result.audioContent;
  } catch (error) {
    console.error("Voice generation failed:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate voice");
  }
}