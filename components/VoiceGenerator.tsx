import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { generateSpeech } from '../services/geminiService';

interface VoiceGeneratorProps {
  isApiKeyMissing: boolean;
}

export const VoiceGenerator: React.FC<VoiceGeneratorProps> = ({ isApiKeyMissing }) => {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter some text to generate speech.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      const audioData = await generateSpeech(text);
      if (audioData) {
        setAudioUrl(audioData);
      } else {
        setError('Failed to generate speech audio.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during speech generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full animate-fadeInUp">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-600 bg-200% animate-gradient-pan">
          AI Voice Generator
        </h1>
        <p className="mt-3 text-lg text-slate-400">
          Transform text into natural-sounding speech
        </p>
      </header>

      <main className="bg-slate-800 shadow-2xl shadow-pink-500/10 rounded-xl p-6 sm:p-10 transition-all duration-300 ease-in-out hover:shadow-pink-400/30">
        <div className="space-y-8">
          <div>
            <label htmlFor="voice-input" className="block text-sm font-medium text-slate-300 mb-1.5">
              Enter text to convert to speech
            </label>
            <textarea
              id="voice-input"
              rows={6}
              className="block w-full shadow-sm sm:text-sm bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500 rounded-md p-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 ease-in-out"
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isGenerating || isApiKeyMissing}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim() || isApiKeyMissing}
            className="w-full group flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-md shadow-sm text-slate-900 bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-pink-400 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner />
                <span className="animate-subtle-pulse">Generating Speech...</span>
              </>
            ) : (
              <span className="transform transition-transform duration-300 group-hover:scale-105 group-focus:scale-105">
                🎙️ Generate Speech
              </span>
            )}
          </button>

          {error && (
            <div role="alert" className="mt-8 p-4 bg-red-800 border border-red-600 text-red-200 rounded-md animate-fadeInUp">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {audioUrl && !isGenerating && (
            <div className="mt-8 p-4 bg-slate-700 rounded-lg animate-fadeInUp">
              <h2 className="text-lg font-semibold text-pink-400 mb-4">Generated Speech</h2>
              <audio
                controls
                className="w-full"
                src={audioUrl}
                onError={(e) => {
                  console.error('Audio playback error:', e);
                  setError('Failed to play the generated audio.');
                }}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};