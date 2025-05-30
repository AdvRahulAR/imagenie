
import React from 'react';

export type Feature = 'imageGenerator' | 'contentCreator'; 

interface FeatureToggleBarProps {
  activeFeature: Feature;
  onFeatureSelect: (feature: Feature) => void;
}

const iconPaths = {
  imageIcon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v10l3-3 2 2 4-4 5 5V6H4z", // Image Icon
  penIcon: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.379L3 13.757V17h3.243L14.62 8.621l-3.242-3.242z", // Pen Icon
};

// Same base64 as the favicon for consistency
const logoBase64 = "data:image/png;base64,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";


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
    }

    return `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out
            ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-800 shadow-lg py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
           <img src={logoBase64} alt="Imagenie Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
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
