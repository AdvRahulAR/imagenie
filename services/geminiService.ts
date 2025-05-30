import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.API_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn("API_KEY environment variable not found. Gemini API calls will fail.");
}

const IMAGE_MODEL_NAME = 'imagen-3.0-generate-002';
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

interface GenerateImageRequest {
  model: string;
  prompt: string;
  config: { numberOfImages: number; outputMimeType: string; };
}

const optimizeUserPrompt = async (userPrompt: string, style: string = ""): Promise<string> => {
  if (!genAI) {
    console.warn("Gemini API client not initialized. Cannot optimize prompt.");
    return style ? `${userPrompt}, in a ${style} style` : userPrompt;
  }

  let systemInstruction = `You are an expert prompt engineer for AI image generation models.
Your task is to take the user's input and rewrite it to be a highly detailed, descriptive, and evocative prompt.
This enhanced prompt should be ideal for generating a high-quality, visually rich image.
Focus on:
- Adding specific visual details (colors, textures, shapes, lighting).
- Elaborating on objects, characters, and environments.
- Suggesting artistic styles, composition, or mood if appropriate and not explicitly countered by the user's prompt.
- Ensuring the output is a single, coherent prompt string.`;

  if (style) {
    systemInstruction = `You are an expert prompt engineer for AI image generation models.
Your task is to take the user's input and rewrite it to be a highly detailed, descriptive, and evocative prompt, ensuring it strongly reflects a '${style}' artistic style.
This enhanced prompt should be ideal for generating a high-quality, visually rich image in the specified style.
Focus on:
- Weaving the '${style}' characteristics naturally into the descriptions.
- Adding specific visual details (colors, textures, shapes, lighting) that align with the '${style}'.
- Elaborating on objects, characters, and environments in a way that fits the '${style}'.
- Maintaining the core subject of the user's prompt.
- Ensuring the output is a single, coherent prompt string.
Return only the rewritten prompt, without any preamble, explanation, or conversational filler.`;
  }
  
  systemInstruction += "\nReturn only the rewritten prompt, without any preamble, explanation, or conversational filler."

  try {
    console.log(`Optimizing prompt: "${userPrompt}" with style: "${style || 'None'}"`);
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL_NAME });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    const response = await result.response;
    let optimizedPromptText = response.text().trim();
    
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = optimizedPromptText.match(fenceRegex);
    if (match && match[2]) {
      optimizedPromptText = match[2].trim();
    }

    if (optimizedPromptText) {
      console.log("Optimized prompt:", optimizedPromptText);
      return optimizedPromptText;
    } else {
      console.warn("Prompt optimization resulted in an empty string. Falling back to original prompt with style if any.");
      return style ? `${userPrompt}, in a ${style} style` : userPrompt;
    }
  } catch (error) {
    console.error("Error optimizing prompt:", error);
    return style ? `${userPrompt}, in a ${style} style` : userPrompt;
  }
};

export const generateImageFromPrompt = async (
  prompt: string,
  optimize: boolean = false,
  style: string = ""
): Promise<GeneratedMediaData[] | null> => {
  if (!genAI) {
    throw new Error("Gemini API client is not initialized. Is the API_KEY configured?");
  }

  let finalPrompt = prompt.trim();

  if (optimize) {
    finalPrompt = await optimizeUserPrompt(finalPrompt, style);
  } else if (style) {
    finalPrompt = `${finalPrompt}, in a ${style} style`;
  }

  console.log(`Generating 4 images with prompt: "${finalPrompt}"`);

  try {
    const model = genAI.getGenerativeModel({ model: IMAGE_MODEL_NAME });
    
    const result = await model.generateImages({
      prompt: finalPrompt,
      n: 4,
      responseFormat: { type: 'jpeg' }
    });

    if (result.images && result.images.length > 0) {
      const imagesData: GeneratedMediaData[] = result.images.map(img => ({
        url: URL.createObjectURL(new Blob([img.data], { type: 'image/jpeg' })),
        mimeType: 'image/jpeg'
      }));
      return imagesData.length > 0 ? imagesData : null;
    }
    
    console.error("No image data found in API response:", result);
    return null;
  } catch (error) {
    console.error('Error generating image with Gemini API:', error);
    if (error instanceof Error) {
      if (error.message.includes("UNIMPLEMENTED") || error.message.includes("INVALID_ARGUMENT")) {
        throw new Error(`Gemini API error: ${error.message}. The model may not support the requested configuration or prompt content.`);
      }
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the image.');
  }
};

export const generateStructuredContent = async (
  userInput: string,
  contentType: string
): Promise<string> => {
  if (!genAI) {
    throw new Error("Gemini API client is not initialized. Is the API_KEY configured?");
  }

  let requestedContentTypeDescription = contentType;
  if (contentType === 'linkedinPost') {
    requestedContentTypeDescription = 'LinkedIn Post / Carousel';
  } else if (contentType === 'linkedinArticle') {
    requestedContentTypeDescription = 'LinkedIn Article';
  } else if (contentType === 'instagramCarousel') {
    requestedContentTypeDescription = 'Instagram Carousel Post';
  }

  const userMessage = `User Input Text/Topic:\n${userInput}\n\nRequested Content Type: ${requestedContentTypeDescription}`;

  console.log(`Generating structured content for type: "${requestedContentTypeDescription}" with Google Search`);

  try {
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL_NAME });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    const response = await result.response;
    let generatedText = response.text().trim();
    
    if (!generatedText) {
      throw new Error("The API returned empty content.");
    }
    return generatedText;

  } catch (error) {
    console.error('Error generating structured content with Gemini API:', error);
    if (error instanceof Error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the content.');
  }
};

export const generateSpeech = async (
  text: string,
  voiceName: string = 'alloy',
  languageCode: string = 'en-US'
): Promise<string | null> => {
  if (!genAI) {
    throw new Error("Gemini API client is not initialized. Is the API_KEY configured?");
  }

  try {
    // Get the text-to-speech model
    const model = genAI.getGenerativeModel({ model: TTS_MODEL_NAME });
    
    // Generate speech
    const result = await model.generateSpeech({
      text,
      voice: voiceName,
      languageCode,
      audioConfig: {
        audioEncoding: 'wav',
        speakingRate: 1.0,
        pitch: 0.0
      }
    });

    if (!result || !result.audioContent) {
      throw new Error("No audio data generated");
    }

    // Convert the audio content to a Blob and create a URL
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