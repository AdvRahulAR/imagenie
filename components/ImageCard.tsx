import React, { useState } from 'react';

interface ImageCardProps {
  src: string;
  alt: string; 
  mimeType?: string;
  aspectRatio?: string;
}

export const ImageCard: React.FC<ImageCardProps> = ({ src, alt, mimeType, aspectRatio = '1:1' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getAspectRatioClass = (ratio: string): string => {
    switch (ratio) {
      case '1:1': return 'aspect-square';
      case '9:16': return 'aspect-[9/16]';
      case '16:9': return 'aspect-[16/9]';
      case '4:3': return 'aspect-[4/3]';
      case '3:4': return 'aspect-[3/4]';
      default: return 'aspect-square';
    }
  };

  const aspectRatioClass = getAspectRatioClass(aspectRatio);

  const handleDownload = () => {
    const sanitizeFilename = (name: string): string => {
      return name.replace(/[^a-z0-9_.\s-]/gi, '_').replace(/\s+/g, '_').substring(0, 60);
    };

    const baseFilename = sanitizeFilename(alt) || 'imagenie_generated_image';
    const actualMimeType = mimeType || 'image/jpeg';
    const extension = actualMimeType === 'image/png' ? 'png' : 'jpeg';
    
    const filename = `${baseFilename}.${extension}`;

    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  // Handle escape key to close fullscreen
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        closeFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFullscreen]);

  return (
    <>
      <div 
        className={`relative bg-slate-800 shadow-xl shadow-black/40 rounded-lg overflow-hidden 
                   transition-all duration-300 ease-in-out transform 
                   hover:scale-105 hover:shadow-yellow-500/40 
                   w-full mx-auto ${aspectRatioClass}`}
      >
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover bg-slate-900" 
          loading="lazy"
          onError={(e) => {
            console.error('Image failed to load:', e);
            e.currentTarget.alt = 'Image failed to load. Please check the source or network.';
          }}
        />
        
        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="absolute top-3 left-3 bg-slate-800 bg-opacity-70 hover:bg-yellow-500 text-white hover:text-slate-900 p-2.5 rounded-full shadow-lg 
                     transition-all duration-300 ease-in-out transform hover:scale-110 focus:scale-110
                     focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
          aria-label="Download image"
          title="Download image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={openFullscreen}
          className="absolute bottom-3 right-3 bg-slate-800 bg-opacity-70 hover:bg-yellow-500 text-white hover:text-slate-900 p-2.5 rounded-full shadow-lg 
                     transition-all duration-300 ease-in-out transform hover:scale-110 focus:scale-110
                     focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
          aria-label="View fullscreen"
          title="View fullscreen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={closeFullscreen}
        >
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 bg-slate-800 bg-opacity-70 hover:bg-red-500 text-white p-3 rounded-full shadow-lg 
                         transition-all duration-300 ease-in-out transform hover:scale-110 focus:scale-110
                         focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
              aria-label="Close fullscreen"
              title="Close fullscreen (ESC)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Download Button in Fullscreen */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="absolute top-4 left-4 z-10 bg-slate-800 bg-opacity-70 hover:bg-yellow-500 text-white hover:text-slate-900 p-3 rounded-full shadow-lg 
                         transition-all duration-300 ease-in-out transform hover:scale-110 focus:scale-110
                         focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
              aria-label="Download image"
              title="Download image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Fullscreen Image */}
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.error('Fullscreen image failed to load:', e);
                e.currentTarget.alt = 'Image failed to load. Please check the source or network.';
              }}
            />

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-800 bg-opacity-80 text-white p-3 rounded-lg">
              <p className="text-sm font-medium truncate">{alt}</p>
              <p className="text-xs text-slate-300 mt-1">
                Click anywhere outside the image or press ESC to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};