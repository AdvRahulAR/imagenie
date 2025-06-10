import React from 'react';

interface ImageCardProps {
  src: string;
  alt: string; 
  mimeType?: string;
  aspectRatio?: string;
}

export const ImageCard: React.FC<ImageCardProps> = ({ src, alt, mimeType, aspectRatio = '1:1' }) => {
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

  return (
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
      <button
        onClick={handleDownload}
        className="absolute top-3 right-3 bg-slate-800 bg-opacity-70 hover:bg-yellow-500 text-white hover:text-slate-900 p-2.5 rounded-full shadow-lg 
                   transition-all duration-300 ease-in-out transform hover:scale-110 focus:scale-110
                   focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
        aria-label="Download image"
        title="Download image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};