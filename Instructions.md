# Voice Generation Fix Plan

## Current Issue
The error "Speech generation error: genAI.getTextToSpeech is not a function" occurs because we're trying to use an incorrect method name and mixing different versions of the Google AI SDK.

## Analysis

### Affected Files
1. services/geminiService.ts
   - Using both `@google/genai` and `@google/generative-ai` packages
   - Incorrect method name being used

2. components/VoiceGenerator.tsx
   - Depends on the generateSpeech function from geminiService
   - Currently using incorrect voice options

3. package.json
   - Has both AI SDKs as dependencies

### Root Cause
1. The error occurs because we're mixing two different versions of the Google AI SDK
2. The method name for text-to-speech generation is incorrect
3. Voice options need to be updated to match the API's supported voices

## Solution Plan

1. Package.json Updates:
   - Remove `@google/genai`
   - Keep `@google/generative-ai` as it's the newer version

2. geminiService.ts Updates:
   - Remove imports from `@google/genai`
   - Use only `GoogleGenerativeAI` from `@google/generative-ai`
   - Update the generateSpeech function to use the correct model and method
   - Update voice options to match API specifications

3. VoiceGenerator.tsx Updates:
   - Update voice selection options
   - Ensure proper error handling
   - Add proper audio MIME type handling

## Implementation Steps

1. Update package.json dependencies
2. Refactor geminiService.ts to use the correct SDK and methods
3. Update voice options and language support
4. Implement proper error handling
5. Test the voice generation feature

## Expected Outcome
- Voice generation should work correctly with the proper SDK
- Users should be able to generate speech from text with different voices
- Proper error handling and user feedback