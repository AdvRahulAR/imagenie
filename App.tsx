
import React, { useState, useCallback, useEffect } from 'react';
import { generateImageFromPrompt, imageStyles, generateStructuredContent } from './services/geminiService';
import { ImageCard } from './components/ImageCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ApiKeyStatusBanner } from './components/ApiKeyStatusBanner';
import { FeatureToggleBar, Feature } from './components/FeatureToggleBar';
import { ContentCreatorAssistant } from './components/ContentCreatorAssistant';

interface GeneratedImageData {
  src: string;
  alt: string;
  mimeType?: string;
}

const App: React.FC = () => {
  // Global states
  const [activeFeature, setActiveFeature] = useState<Feature>('imageGenerator');
  const [showApiKeyBanner, setShowApiKeyBanner] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);


  // Image Generator States
  const [prompt, setPrompt] = useState<string>('');
  const [optimizePrompt, setOptimizePrompt] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[] | null>(null);
  const [isGeneratingImages, setIsGeneratingImages] = useState<boolean>(false);
  const [imageGenerationError, setImageGenerationError] = useState<string | null>(null);

  // Content Creator States
  const [contentInput, setContentInput] = useState<string>('');
  const [selectedContentType, setSelectedContentType] = useState<string>('linkedinPost');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState<boolean>(false);
  const [contentGenerationError, setContentGenerationError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = (window as any).API_KEY || process.env.API_KEY;
    if (!apiKey) {
      setShowApiKeyBanner(true);
      setGlobalError("API Key is not configured. Features requiring Gemini API (Image & Content Gen) will not work.");
    } else {
        setShowApiKeyBanner(false);
        setGlobalError(null);
    }
  }, []);

  const handleImageGeneration = useCallback(async () => {
    if (!prompt.trim()) {
      setImageGenerationError('Please enter a prompt for image generation.');
      return;
    }
    setIsGeneratingImages(true);
    setImageGenerationError(null);
    setGeneratedImages(null);

    try {
      const imagesDataArray = await generateImageFromPrompt(prompt, optimizePrompt, selectedStyle);
      if (imagesDataArray && imagesDataArray.length > 0) {
        setGeneratedImages(
          imagesDataArray.map((imageData, index) => ({
            src: imageData.url,
            alt: `${prompt} - Image ${index + 1}`,
            mimeType: imageData.mimeType,
          }))
        );
      } else {
        setImageGenerationError('Failed to generate images. The API returned no image data.');
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred during image generation.';
      setImageGenerationError(message);
    } finally {
      setIsGeneratingImages(false);
    }
  }, [prompt, optimizePrompt, selectedStyle]);

  const handleContentGeneration = useCallback(async (userInput: string, contentType: string) => {
    if (!userInput.trim()) {
      setContentGenerationError('Please enter some content or a topic.');
      return;
    }
    setIsGeneratingContent(true);
    setContentGenerationError(null);
    setGeneratedContent(null); 

    setContentInput(userInput);
    setSelectedContentType(contentType);

    try {
      const result = await generateStructuredContent(userInput, contentType);
      setGeneratedContent(result);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred during content generation.';
      setContentGenerationError(message);
    } finally {
      setIsGeneratingContent(false);
    }
  }, []);
  
  const handleFeatureSelect = (feature: Feature) => {
    setActiveFeature(feature);
    // Reset errors and content of other features when switching
    if (feature === 'imageGenerator') {
        setContentGenerationError(null);
    } else if (feature === 'contentCreator') {
        setImageGenerationError(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <FeatureToggleBar activeFeature={activeFeature} onFeatureSelect={handleFeatureSelect} />
      
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {showApiKeyBanner && <ApiKeyStatusBanner className="animate-fadeInDown mb-6" errorText={globalError} />}

        {activeFeature === 'imageGenerator' && (
          <>
            <header className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 bg-200% animate-gradient-pan">
                Image Generation
              </h1>
              <p className="mt-3 text-lg text-slate-400">
                Turn your words into stunning visuals with AI.
              </p>
            </header>

            <main className="bg-slate-800 shadow-2xl shadow-yellow-500/10 rounded-xl p-6 sm:p-10 transition-all duration-300 ease-in-out hover:shadow-yellow-400/30">
              <div className="space-y-8">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Enter your image prompt
                  </label>
                  <textarea
                    id="prompt"
                    name="prompt"
                    rows={4}
                    className="block w-full shadow-sm sm:text-sm bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500 rounded-md p-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ease-in-out"
                    placeholder="e.g., Cyborg fox, neon city, red scarf..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGeneratingImages || showApiKeyBanner}
                    aria-label="Enter prompt for image generation"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="optimize-prompt-toggle"
                      type="checkbox"
                      className="h-5 w-5 text-yellow-500 border-slate-600 rounded bg-slate-700 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-slate-800 transition-all duration-300 ease-in-out cursor-pointer"
                      checked={optimizePrompt}
                      onChange={(e) => setOptimizePrompt(e.target.checked)}
                      disabled={isGeneratingImages || showApiKeyBanner}
                      aria-describedby="optimize-prompt-description"
                    />
                    <label htmlFor="optimize-prompt-toggle" className="ml-2.5 text-sm font-medium text-slate-300 cursor-pointer transition-colors duration-300 hover:text-yellow-400">
                      Enable Prompt Optimizer
                    </label>
                  </div>
                  <p id="optimize-prompt-description" className="text-xs text-slate-500">
                    (Uses AI to enhance your prompt)
                  </p>
                </div>
                
                <div>
                  <label htmlFor="style-select" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Select Image Style (Optional)
                  </label>
                  <select
                    id="style-select"
                    name="style"
                    className="block w-full shadow-sm sm:text-sm bg-slate-700 border-slate-600 text-slate-200 rounded-md p-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ease-in-out"
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    disabled={isGeneratingImages || showApiKeyBanner}
                    aria-label="Select image style"
                  >
                    {imageStyles.map(style => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleImageGeneration}
                  disabled={isGeneratingImages || !prompt.trim() || showApiKeyBanner}
                  className="w-full group flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-md shadow-sm text-slate-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-yellow-400 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
                  aria-live="polite"
                >
                  {isGeneratingImages ? (
                    <>
                      <LoadingSpinner />
                      <span className="animate-subtle-pulse">Generating Images...</span>
                    </>
                  ) : (
                    <span className="transform transition-transform duration-300 group-hover:scale-105 group-focus:scale-105">✨ Generate Images</span>
                  )}
                </button>
              </div>

              {imageGenerationError && (
                <div role="alert" className="mt-8 p-4 bg-red-800 border border-red-600 text-red-200 rounded-md animate-fadeInUp">
                  <p className="font-semibold">Error:</p>
                  <p>{imageGenerationError}</p>
                </div>
              )}

              {generatedImages && generatedImages.length > 0 && !isGeneratingImages && (
                <div className={`mt-12 ${generatedImages && generatedImages.length > 0 && !isGeneratingImages ? 'animate-fadeInUp' : 'opacity-0'}`}>
                  <h2 className="text-2xl font-semibold text-yellow-400 mb-6 text-center">
                    Your Masterpieces
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generatedImages.map((image, index) => (
                      <ImageCard
                        key={image.src + index} 
                        src={image.src}
                        alt={image.alt} 
                        mimeType={image.mimeType}
                      />
                    ))}
                  </div>
                </div>
              )}
            </main>
          </>
        )}

        {activeFeature === 'contentCreator' && (
           <ContentCreatorAssistant
            onSubmit={handleContentGeneration}
            isLoading={isGeneratingContent}
            error={contentGenerationError}
            generatedContentResult={generatedContent}
            isApiKeyMissing={showApiKeyBanner}
            lastUserInput={contentInput}
            lastSelectedContentType={selectedContentType}
          />
        )}
        
        <footer className="text-center mt-12 py-6 text-sm text-slate-500">
          <p>Powered by Google Gemini & Imagen 3</p>
          <p>&copy; 2025 Imagenie by UB Intelligence. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
