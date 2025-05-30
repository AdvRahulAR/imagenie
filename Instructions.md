# Imagenie Implementation Guide

## Setup and Configuration

1. Environment Setup
   - Create a `.env` file in the project root
   - Add your Gemini API key:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```

2. Dependencies
   - The project uses `@google/generative-ai` for all Gemini API interactions
   - Ensure all dependencies are installed:
     ```bash
     npm install
     ```

## Implementation Details

### 1. Image Generation
- Model: `imagen-3.0-generate-002`
- Function: `generateImageFromPrompt`
- Features:
  - Supports style customization
  - Generates 4 images per request
  - 1024x1024 resolution
  - Returns URLs for generated images

### 2. Content Generation
- Model: `gemini-2.5-flash-preview-04-17`
- Function: `generateStructuredContent`
- Features:
  - Customizable generation parameters
  - Supports different content types
  - Returns formatted text content

### 3. Voice Generation
- Model: `gemini-2.5-flash-preview-tts`
- Function: `generateSpeech`
- Features:
  - Multiple voice options
  - Language support
  - Returns audio as blob URL

## Usage Examples

```typescript
// Image Generation
const images = await generateImageFromPrompt(
  "A serene mountain landscape at sunset",
  false,
  "Watercolor Painting"
);

// Content Generation
const content = await generateStructuredContent(
  "Write about artificial intelligence",
  "linkedinPost"
);

// Voice Generation
const audioUrl = await generateSpeech(
  "Hello, this is a test message",
  "alloy",
  "en-US"
);
```

## Error Handling

All functions include comprehensive error handling:
- API key validation
- Input validation
- Response validation
- Detailed error messages

## Best Practices

1. Always check API key configuration
2. Handle errors appropriately in UI
3. Implement loading states for async operations
4. Clean up blob URLs when no longer needed