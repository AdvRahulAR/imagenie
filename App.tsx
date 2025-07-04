import React, { useState, useCallback, useEffect } from 'react';
import { generateImageFromPrompt, imageStyles, generateStructuredContent, imageModels } from './services/geminiService';
import { ImageCard } from './components/ImageCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ApiKeyStatusBanner } from './components/ApiKeyStatusBanner';
import { FeatureToggleBar, Feature } from './components/FeatureToggleBar';
import { ContentCreatorAssistant } from './components/ContentCreatorAssistant';
import { VoiceGenerator } from './components/VoiceGenerator';

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
  const [selectedImageModel, setSelectedImageModel] = useState<string>(imageModels[0].value);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [numImages, setNumImages] = useState<number>(4);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('1:1');
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
      setGlobalError("API Key is not configured. Features requiring Gemini API (Image, Content & Voice Gen) will not work.");
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
      const imagesDataArray = await generateImageFromPrompt(prompt, optimizePrompt, selectedStyle, numImages, selectedAspectRatio, selectedImageModel, selectedImageFile);
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
  }, [prompt, optimizePrompt, selectedStyle, numImages, selectedAspectRatio, selectedImageModel, selectedImageFile]);

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

  const aspectRatios = [
    { value: '1:1', label: '1:1', icon: '⬜' },
    { value: '9:16', label: '9:16', icon: '📱' },
    { value: '16:9', label: '16:9', icon: '🖥️' },
    { value: '4:3', label: '4:3', icon: '📺' },
    { value: '3:4', label: '3:4', icon: '📄' }
  ];


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
                
                {/* Parallel Controls: Image Model, Upload Reference Image (conditional), and Image Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Image Model Selection */}
                  <div>
                    <label htmlFor="model-select" className="block text-sm font-medium text-slate-300 mb-1.5">
                      Select Image Model
                    </label>
                    <select
                      id="model-select"
                      name="model"
                      className="block w-full shadow-sm sm:text-sm bg-slate-700 border-slate-600 text-slate-200 rounded-md p-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ease-in-out"
                      value={selectedImageModel}
                      onChange={(e) => {
                        setSelectedImageModel(e.target.value);
                        // Clear selected image file when switching away from image-to-image model
                        if (e.target.value !== 'gemini-2.0-flash-preview-image-generation') {
                          setSelectedImageFile(null);
                        }
                      }}
                      disabled={isGeneratingImages || showApiKeyBanner}
                      aria-label="Select image generation model"
                    >
                      {imageModels.map(model => (
                        <option key={model.value} value={model.value}>
                          {model.description}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedImageModel === 'gemini-2.0-flash-preview-image-generation' 
                        ? 'Upload a reference image to generate variations or modifications'
                        : 'Imagen 4.0 offers enhanced quality and capabilities but is in preview'
                      }
                    </p>
                  </div>

                  {/* Upload Reference Image - Only show for image-to-image model */}
                  {selectedImageModel === 'gemini-2.0-flash-preview-image-generation' ? (
                    <div>
                      <label htmlFor="image-upload" className="block text-sm font-medium text-slate-300 mb-1.5">
                        Upload Reference Image
                      </label>
                      <div className="space-y-3">
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setSelectedImageFile(file);
                          }}
                          disabled={isGeneratingImages || showApiKeyBanner}
                          className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-slate-900 hover:file:bg-yellow-600 file:transition-colors file:duration-300 bg-slate-700 border border-slate-600 rounded-md cursor-pointer focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                        {selectedImageFile && (
                          <div className="flex items-center justify-between p-3 bg-slate-700 border border-slate-600 rounded-md">
                            <div className="flex items-center space-x-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-slate-300 truncate max-w-xs">
                                {selectedImageFile.name}
                              </span>
                              <span className="text-xs text-slate-500">
                                ({(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedImageFile(null)}
                              disabled={isGeneratingImages}
                              className="text-red-400 hover:text-red-300 transition-colors duration-300 disabled:opacity-50"
                              aria-label="Remove selected image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-slate-500">
                          Supported formats: JPEG, PNG, WebP. Max size: 20MB. The AI will use this image as a reference to generate new variations.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div></div> // Empty div to maintain grid layout when upload section is hidden
                  )}

                  {/* Image Style Selection */}
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
                </div>

                {/* Number of Results and Aspect Ratio Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Number of Results Control - Only show for non-image-to-image models */}
                  {selectedImageModel !== 'gemini-2.0-flash-preview-image-generation' && (
                    <div>
                      <label htmlFor="num-images-slider" className="block text-sm font-medium text-slate-300 mb-2">
                        Number of results
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          id="num-images-slider"
                          type="range"
                          min="1"
                          max="4"
                          value={numImages}
                          onChange={(e) => setNumImages(parseInt(e.target.value))}
                          disabled={isGeneratingImages || showApiKeyBanner}
                          className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider-thumb"
                          style={{
                            background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((numImages - 1) / 3) * 100}%, #475569 ${((numImages - 1) / 3) * 100}%, #475569 100%)`
                          }}
                        />
                        <div className="w-10 h-8 bg-slate-700 border border-slate-600 rounded-md flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-200">{numImages}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aspect Ratio Control */}
                  <div className={selectedImageModel === 'gemini-2.0-flash-preview-image-generation' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Aspect ratio
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {aspectRatios.map((ratio) => (
                        <button
                          key={ratio.value}
                          type="button"
                          onClick={() => setSelectedAspectRatio(ratio.value)}
                          disabled={isGeneratingImages || showApiKeyBanner}
                          className={`relative px-2 py-1.5 rounded-md border transition-all duration-200 ease-in-out ${
                            selectedAspectRatio === ratio.value
                              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                              : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-yellow-400 hover:text-yellow-400'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          aria-label={`Select ${ratio.label} aspect ratio`}
                        >
                          <div className="flex items-center space-x-1">
                            <span className="text-xs">{ratio.icon}</span>
                            <span className="text-xs font-medium">{ratio.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleImageGeneration}
                  disabled={
                    isGeneratingImages || 
                    !prompt.trim() || 
                    showApiKeyBanner ||
                    (selectedImageModel === 'gemini-2.0-flash-preview-image-generation' && !selectedImageFile)
                  }
                  className="w-full group flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-md shadow-sm text-slate-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-yellow-400 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
                  aria-live="polite"
                >
                  {isGeneratingImages ? (
                    <>
                      <LoadingSpinner />
                      <span className="animate-subtle-pulse">
                        Generating {selectedImageModel === 'gemini-2.0-flash-preview-image-generation' ? 'Image-to-Image' : `${numImages} Image${numImages > 1 ? 's' : ''}`}...
                      </span>
                    </>
                  ) : (
                    <span className="transform transition-transform duration-300 group-hover:scale-105 group-focus:scale-105">
                      ✨ Generate {selectedImageModel === 'gemini-2.0-flash-preview-image-generation' ? 'Image-to-Image' : `${numImages} Image${numImages > 1 ? 's' : ''}`}
                    </span>
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
                  <div className={`grid gap-6 ${
                    generatedImages.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                    generatedImages.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  }`}>
                    {generatedImages.map((image, index) => (
                      <ImageCard
                        key={image.src + index} 
                        src={image.src}
                        alt={image.alt} 
                        mimeType={image.mimeType}
                        aspectRatio={selectedAspectRatio}
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

        {activeFeature === 'voiceGenerator' && (
          <VoiceGenerator isApiKeyMissing={showApiKeyBanner} />
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