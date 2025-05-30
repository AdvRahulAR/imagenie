
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LoadingSpinner } from './LoadingSpinner';

interface ContentCreatorAssistantProps {
  onSubmit: (userInput: string, contentType: string) => void;
  isLoading: boolean;
  error: string | null;
  generatedContentResult: string | null;
  isApiKeyMissing: boolean;
  lastUserInput: string; // Added to hold the successfully submitted input for regeneration
  lastSelectedContentType: string; // Added to hold the successfully submitted type for regeneration
}

const contentTypes = [
  { value: 'linkedinPost', label: 'LinkedIn Post / Carousel' },
  { value: 'linkedinArticle', label: 'LinkedIn Article' },
  { value: 'instagramCarousel', label: 'Instagram Carousel Post' },
];

export const ContentCreatorAssistant: React.FC<ContentCreatorAssistantProps> = ({
  onSubmit,
  isLoading,
  error,
  generatedContentResult,
  isApiKeyMissing,
  lastUserInput,
  lastSelectedContentType
}) => {
  const [currentUserInput, setCurrentUserInput] = useState<string>('');
  const [currentSelectedContentType, setCurrentSelectedContentType] = useState<string>(contentTypes[0].value);

  // Sync local state with prop if needed (e.g., if App.tsx controls initial values)
  useEffect(() => {
    if (lastUserInput) setCurrentUserInput(lastUserInput);
  }, [lastUserInput]);

  useEffect(() => {
    if (lastSelectedContentType) setCurrentSelectedContentType(lastSelectedContentType);
  }, [lastSelectedContentType]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserInput.trim()) return;
    onSubmit(currentUserInput, currentSelectedContentType);
  };

  const handleRegenerate = () => {
    // Use the props `lastUserInput` and `lastSelectedContentType` which represent the *last successfully submitted* values
    if (!lastUserInput.trim() || isApiKeyMissing || isLoading) return;
    onSubmit(lastUserInput, lastSelectedContentType);
  };

  return (
    <div className="w-full animate-fadeInUp">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-500 to-teal-600 bg-200% animate-gradient-pan">
          AI Content Creator
        </h1>
        <p className="mt-3 text-lg text-slate-400">
          Generate engaging content for your social platforms.
        </p>
      </header>

      <main className="bg-slate-800 shadow-2xl shadow-cyan-500/10 rounded-xl p-6 sm:p-10 transition-all duration-300 ease-in-out hover:shadow-cyan-400/30">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="content-input" className="block text-sm font-medium text-slate-300 mb-1.5">
              Enter your base content, topic, or URL (AI will process text)
            </label>
            <textarea
              id="content-input"
              name="content-input"
              rows={8}
              className="block w-full shadow-sm sm:text-sm bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 ease-in-out"
              placeholder="Paste your article, notes, legal document text, or describe the topic..."
              value={currentUserInput}
              onChange={(e) => setCurrentUserInput(e.target.value)}
              disabled={isLoading || isApiKeyMissing}
              aria-label="Enter base content for AI generation"
            />
            <p className="mt-2 text-xs text-slate-500">
              Provide detailed text for best results. If providing a URL, please paste the text content from the URL.
            </p>
          </div>

          <div>
            <label htmlFor="content-type-select" className="block text-sm font-medium text-slate-300 mb-1.5">
              Select Content Output Type
            </label>
            <select
              id="content-type-select"
              name="contentType"
              className="block w-full shadow-sm sm:text-sm bg-slate-700 border-slate-600 text-slate-200 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 ease-in-out"
              value={currentSelectedContentType}
              onChange={(e) => setCurrentSelectedContentType(e.target.value)}
              disabled={isLoading || isApiKeyMissing}
              aria-label="Select content output type"
            >
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading || !currentUserInput.trim() || isApiKeyMissing}
            className="w-full group flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-md shadow-sm text-slate-900 bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-400 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
            aria-live="polite"
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                <span className="animate-subtle-pulse">Generating Content...</span>
              </>
            ) : (
              <span className="transform transition-transform duration-300 group-hover:scale-105 group-focus:scale-105">🚀 Generate Content</span>
            )}
          </button>
        </form>

        {error && (
          <div role="alert" className="mt-8 p-4 bg-red-800 border border-red-600 text-red-200 rounded-md animate-fadeInUp">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {generatedContentResult && !isLoading && (
          <div className="mt-12">
            <div className="prose prose-invert max-w-none prose-sm sm:prose-base lg:prose-lg animate-fadeInUp 
                          prose-headings:text-cyan-400 prose-a:text-cyan-400 prose-strong:text-slate-100 
                          prose-bullets:marker:text-cyan-500 prose-ul:marker:text-cyan-500 prose-ol:marker:text-cyan-500 
                          prose-pre:bg-slate-900 prose-pre:shadow-inner prose-pre:p-4 prose-pre:rounded-lg
                          prose-code:text-amber-400 prose-code:bg-slate-700/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
              <h2 className="text-2xl font-semibold text-cyan-300 mb-6 text-center !my-0">
                Generated Content
              </h2>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {generatedContentResult}
              </ReactMarkdown>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isLoading || !lastUserInput.trim() || isApiKeyMissing}
                className="group flex justify-center items-center px-6 py-3 border border-cyan-600 text-base font-semibold rounded-md shadow-sm text-cyan-300 bg-slate-700 hover:bg-slate-600 hover:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:border-slate-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
                aria-live="polite"
                title="Regenerate content with the same input"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    <span className="animate-subtle-pulse">Regenerating...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Regenerate Content
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};