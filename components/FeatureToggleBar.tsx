import React from 'react';

export type Feature = 'imageGenerator' | 'contentCreator' | 'voiceGenerator';

interface FeatureToggleBarProps {
  activeFeature: Feature;
  onFeatureSelect: (feature: Feature) => void;
}

const iconPaths = {
  imageIcon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v10l3-3 2 2 4-4 5 5V6H4z",
  penIcon: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.379L3 13.757V17h3.243L14.62 8.621l-3.242-3.242z",
  voiceIcon: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
};

export const FeatureToggleBar: React.FC<FeatureToggleBarProps> = ({ activeFeature, onFeatureSelect }) => {
  const getButtonClass = (feature: Feature, isActive: boolean) => {
    let activeClasses = '';
    let inactiveClasses = 'text-slate-300 hover:bg-slate-700';

    if (feature === 'imageGenerator') {
      activeClasses = 'bg-yellow-500 text-slate-900 shadow-md';
      inactiveClasses += ' hover:text-yellow-400';
    } else if (feature === 'contentCreator') {
      activeClasses = 'bg-cyan-500 text-slate-900 shadow-md';
      inactiveClasses += ' hover:text-cyan-400';
    } else if (feature === 'voiceGenerator') {
      activeClasses = 'bg-pink-500 text-slate-900 shadow-md';
      inactiveClasses += ' hover:text-pink-400';
    }

    return `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out
            ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-800 shadow-lg py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <a href="/" className="flex items-center">
            <img 
              src="/Logo1 copy.png" 
              alt="Imagenie Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain transition-transform duration-300 hover:scale-105"
            />
          </a>
          <button
            onClick={() => onFeatureSelect('imageGenerator')}
            className={getButtonClass('imageGenerator', activeFeature === 'imageGenerator')}
            aria-pressed={activeFeature === 'imageGenerator'}
            aria-label="Switch to Image Generator"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d={iconPaths.imageIcon} />
            </svg>
            <span className="hidden sm:inline">Image Gen</span>
            <span className="sm:hidden">Image</span>
          </button>
          <button
            onClick={() => onFeatureSelect('contentCreator')}
            className={getButtonClass('contentCreator', activeFeature === 'contentCreator')}
            aria-pressed={activeFeature === 'contentCreator'}
            aria-label="Switch to Content Creator Assistant"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d={iconPaths.penIcon} />
            </svg>
            <span className="hidden sm:inline">Content Gen</span>
            <span className="sm:hidden">Content</span>
          </button>
          <button
            onClick={() => onFeatureSelect('voiceGenerator')}
            className={getButtonClass('voiceGenerator', activeFeature === 'voiceGenerator')}
            aria-pressed={activeFeature === 'voiceGenerator'}
            aria-label="Switch to Voice Generator"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d={iconPaths.voiceIcon} />
            </svg>
            <span className="hidden sm:inline">Voice Gen</span>
            <span className="sm:hidden">Voice</span>
          </button>
        </div>
        
        <div 
          className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text 
                     bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 
                     bg-200% animate-gradient-pan"
        >
          Imagenie
        </div>
      </div>
    </nav>
  );
};