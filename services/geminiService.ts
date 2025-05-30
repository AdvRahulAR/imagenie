import { GoogleGenAI, GenerateImagesResponse, GenerateContentResponse } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn("API_KEY environment variable not found. Gemini API calls will fail.");
}

const IMAGE_MODEL_NAME = 'imagen-3.0-generate-002';
const TEXT_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';
const TTS_MODEL_NAME = 'gemini-2.5-flash-preview-tts';

// Voice options with their characteristics
export const voiceOptions = [
  { value: 'Zephyr', label: 'Zephyr', characteristic: 'Bright' },
  { value: 'Puck', label: 'Puck', characteristic: 'Upbeat' },
  { value: 'Charon', label: 'Charon', characteristic: 'Informative' },
  { value: 'Kore', label: 'Kore', characteristic: 'Firm' },
  { value: 'Fenrir', label: 'Fenrir', characteristic: 'Excitable' },
  { value: 'Leda', label: 'Leda', characteristic: 'Youthful' },
  { value: 'Orus', label: 'Orus', characteristic: 'Firm' },
  { value: 'Aoede', label: 'Aoede', characteristic: 'Breezy' },
  { value: 'Callirrhoe', label: 'Callirrhoe', characteristic: 'Easy-going' },
  { value: 'Autonoe', label: 'Autonoe', characteristic: 'Bright' },
  { value: 'Enceladus', label: 'Enceladus', characteristic: 'Breathy' },
  { value: 'Iapetus', label: 'Iapetus', characteristic: 'Clear' },
  { value: 'Umbriel', label: 'Umbriel', characteristic: 'Easy-going' },
  { value: 'Algieba', label: 'Algieba', characteristic: 'Smooth' },
  { value: 'Despina', label: 'Despina', characteristic: 'Smooth' },
  { value: 'Erinome', label: 'Erinome', characteristic: 'Clear' },
  { value: 'Algenib', label: 'Algenib', characteristic: 'Gravelly' },
  { value: 'Rasalgethi', label: 'Rasalgethi', characteristic: 'Informative' },
  { value: 'Laomedeia', label: 'Laomedeia', characteristic: 'Upbeat' },
  { value: 'Achernar', label: 'Achernar', characteristic: 'Soft' },
  { value: 'Alnilam', label: 'Alnilam', characteristic: 'Firm' },
  { value: 'Schedar', label: 'Schedar', characteristic: 'Even' },
  { value: 'Gacrux', label: 'Gacrux', characteristic: 'Mature' },
  { value: 'Pulcherrima', label: 'Pulcherrima', characteristic: 'Forward' },
  { value: 'Achird', label: 'Achird', characteristic: 'Friendly' },
  { value: 'Zubenelgenubi', label: 'Zubenelgenubi', characteristic: 'Casual' },
  { value: 'Vindemiatrix', label: 'Vindemiatrix', characteristic: 'Gentle' },
  { value: 'Sadachbia', label: 'Sadachbia', characteristic: 'Lively' },
  { value: 'Sadaltager', label: 'Sadaltager', characteristic: 'Knowledgeable' },
  { value: 'Sulafat', label: 'Sulafat', characteristic: 'Warm' }
];

// Supported languages with their BCP-47 codes
export const supportedLanguages = [
  { code: 'ar-EG', name: 'Arabic (Egyptian)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-US', name: 'Spanish (US)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'id-ID', name: 'Indonesian (Indonesia)' },
  { code: 'it-IT', name: 'Italian (Italy)' },
  { code: 'ja-JP', name: 'Japanese (Japan)' },
  { code: 'ko-KR', name: 'Korean (Korea)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ru-RU', name: 'Russian (Russia)' },
  { code: 'nl-NL', name: 'Dutch (Netherlands)' },
  { code: 'pl-PL', name: 'Polish (Poland)' },
  { code: 'th-TH', name: 'Thai (Thailand)' },
  { code: 'tr-TR', name: 'Turkish (Turkey)' },
  { code: 'vi-VN', name: 'Vietnamese (Vietnam)' },
  { code: 'ro-RO', name: 'Romanian (Romania)' },
  { code: 'uk-UA', name: 'Ukrainian (Ukraine)' },
  { code: 'bn-BD', name: 'Bengali (Bangladesh)' },
  { code: 'en-IN', name: 'English (India)' },
  { code: 'mr-IN', name: 'Marathi (India)' },
  { code: 'ta-IN', name: 'Tamil (India)' },
  { code: 'te-IN', name: 'Telugu (India)' }
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
  { value: "Steampunk", label: "Steampunk" },
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
  if (!ai) {
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
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    let optimizedPromptText = response.text.trim();
    
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
  if (!ai) {
    throw new Error("Gemini API client is not initialized. Is the API_KEY configured?");
  }

  let finalPrompt = prompt.trim();

  if (optimize) {
    finalPrompt = await optimizeUserPrompt(finalPrompt, style);
  } else if (style) {
    finalPrompt = `${finalPrompt}, in a ${style} style`;
  }

  console.log(`Generating 4 images with prompt: "${finalPrompt}"`);

  const generationRequest: GenerateImageRequest = {
    model: IMAGE_MODEL_NAME,
    prompt: finalPrompt,
    config: { numberOfImages: 4, outputMimeType: 'image/jpeg' },
  };

  try {
    const response: GenerateImagesResponse = await ai.models.generateImages(generationRequest);

    if (response.generatedImages && response.generatedImages.length > 0) {
      const imagesData: GeneratedMediaData[] = [];
      for (const imageInfo of response.generatedImages) {
        if (imageInfo.image && imageInfo.image.imageBytes) {
          const base64ImageBytes: string = imageInfo.image.imageBytes;
          const mimeType = imageInfo.image.mimeType || 'image/jpeg';
          const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
          imagesData.push({ url: imageUrl, mimeType: mimeType });
        }
      }
      return imagesData.length > 0 ? imagesData : null;
    }
    console.error("No image data found in API response:", response);
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

const CONTENT_CREATOR_SYSTEM_PROMPT = `AI Content Creator Assistant for Carousal Posts & LinkedIn Articles

Primary Function:
Generate engaging, platform-optimized content packages for Instagram Carousels, LinkedIn Carousels, and LinkedIn Articles based on user-provided content (via links or direct text). The content may include legal case judgments, business insights, or industry news. You will use Google Search to find relevant and up-to-date information to fulfill the request.

Core Output Structure:
(This section describes all possible output formats. You will ONLY generate the format specified in "Requested Content Type" from the user's message.)

1. Content Title & Source
   - Official title or headline (case name, article title, or topic)
   - Source/citation (if applicable, include URLs from search if used)
   - Year or date of publication/event
   - Relevant organization, court, or jurisdiction (if legal)

2. Social Media Content Package

   IF "Instagram Carousel Post" OR "LinkedIn Post/Carousel" is requested:
   - Instagram/LinkedIn Carousel
     - Main Post
       - Headline (max 50 characters, catchy and platform-appropriate)
       - Brief description (max 150 words, summarizing the core message)
       - Primary image prompt description (for AI image generation)
     - Slide Content (For Carousel format)
       - Slide 1: Key Takeaways (max 300 characters, bullet points)
       - Slide 2: Context & Impact (max 300 characters, bullet points)
       - Slide 3: Practical Implications (max 300 characters, bullet points)
       (If LinkedIn Post is not a carousel, adapt the "Main Post" structure for a single, impactful post. Image prompt description is still valuable.)

   IF "LinkedIn Article" is requested:
   - LinkedIn Article
     - Structured summary with clear headings and bullet points
     - Expanded analysis (400–600 words) focusing on insights, implications, and actionable points
     - Statutory references or data points (if applicable)
     - Practical recommendations for professionals

3. Technical Elements (Applicable to the CHOSEN format)
   - Relevant viral hashtags for each platform (e.g., #lawyers #lawschool #judge #advocate #legalright #legalawareness for legal topics; adapt for other domains)
   - Image specifications (1080x1080px, optimized for social media, especially for Carousels)
   - Content categorization tags (e.g., Law, Business, Tech, Case Study)
   - Music suggestion for Instagram post (genre or track style matching the content tone, ONLY if Instagram Carousel is requested)
   - Citation format appropriate for the content type and platform (ensure URLs from search are cited if used)

Content Guidelines:
- Use clear, accessible language; maintain accuracy and credibility.
- Focus on practical implications and real-world impact.
- Avoid jargon unless essential; explain terms when used.
- Highlight key insights, precedential value (for legal), or actionable takeaways.
- Maintain a neutral, professional tone.
- Include statutory or data references where applicable, citing sources.
- Structure responses with clear headings and bullet points.
- Use bold for important terms or holdings.
- Apply markdown formatting for emphasis and readability (e.g., **bold**, *italics*, # Heading, - List item).
- Ensure consistent citation style throughout.

Additional Requirements (Applicable to the CHOSEN format):
- Add a short, concise summary (2–3 sentences) at the end for voiceover or audio generation.
- Suggest music suitable for Instagram posts based on the content's mood and theme (ONLY if Instagram Carousel is requested).

Input Context:
The user will provide text content (e.g., legal judgment, business article, or industry update) or a topic for research, and will specify the desired output format in "Requested Content Type".

Output Task:
CRITICAL: Your SOLE task is to generate content *ONLY* for the 'Requested Content Type' specified by the user. Under NO circumstances should you produce outputs for any other formats described in the 'Core Output Structure' section. That section is a general reference for all your capabilities, but for THIS request, adhere strictly to the single 'Requested Content Type'.

Based on the user's input text/topic and their "Requested Content Type", use Google Search to gather necessary information.
Then, generate a ready-to-publish content package *specifically tailored for the CHOSEN platform and format*.
For example, if "LinkedIn Article" is requested, only provide the LinkedIn Article structure. If "Instagram Carousel Post" is requested, only provide the Instagram Carousel structure.
If "LinkedIn Post/Carousel" is selected, assume a LinkedIn Carousel format unless the content naturally fits a shorter, single post, but prioritize carousel elements.
Ensure all technical, creative, and formatting elements relevant to the CHOSEN format are included. Cite any web sources used.
`;

export const generateStructuredContent = async (
  userInput: string,
  contentType: string // e.g., "linkedinPost", "linkedinArticle", "instagramCarousel"
): Promise<string> => {
  if (!ai) {
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
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: userMessage,
      config: {
        systemInstruction: CONTENT_CREATOR_SYSTEM_PROMPT,
        tools: [{googleSearch: {}}], // Enable Google Search grounding
      }
    });
    
    // Log grounding metadata if available
    if (response.candidates && response.candidates[0]?.groundingMetadata?.groundingChunks) {
        console.log("Grounding chunks from Google Search:", response.candidates[0].groundingMetadata.groundingChunks);
    }

    let generatedText = response.text.trim();
    
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
  voiceName: string = 'Kore',
  languageCode: string = 'en-US'
): Promise<string | null> => {
  if (!genAI) {
    throw new Error("Gemini API client is not initialized. Is the API_KEY configured?");
  }

  try {
    const model = genAI.getGenerativeModel({ model: TTS_MODEL_NAME });
    
    const result = await model.generateSpeech({
      text,
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: voiceName
        }
      },
      languageCode: languageCode
    });
    
    if (!result) {
      throw new Error("No audio data generated");
    }

    // Convert the audio data to a URL that can be played
    const blob = new Blob([result], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error generating speech:', error);
    if (error instanceof Error) {
      throw new Error(`Speech generation error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating speech.');
  }
};