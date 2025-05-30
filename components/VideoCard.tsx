import React from 'react';

interface VideoCardProps {
  src: string;
  mimeType?: string;
  title?: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}

const getAspectRatioClass = (ratio: VideoCardProps['aspectRatio']): string => {
  switch (ratio) {
    case '1:1': return 'aspect-square';
    case '16:9': return 'aspect-[16/9]';
    case '9:16': return 'aspect-[9/16]';
    case '4:3': return 'aspect-[4/3]';
    case '3:4': return 'aspect-[3/4]';
    default: return 'aspect-video'; 
  }
};

export const VideoCard: React.FC<VideoCardProps> = ({ src, mimeType = 'video/mp4', title, aspectRatio }) => {
  const aspectRatioClass = getAspectRatioClass(aspectRatio);
  return (
    <div className={`bg-black shadow-xl shadow-black/30 rounded-lg overflow-hidden w-full mx-auto ${aspectRatioClass}`}>
      <video
        controls
        src={src}
        className="w-full h-full object-contain"
        title={title || "Generated video content"}
        aria-label={title || "Generated video content"}
        onError={(e) => console.error('Video failed to load:', e)}
        preload="metadata"
      >
        <source src={src} type={mimeType} />
        <p className="p-4 text-yellow-300">
          Your browser does not support the video tag. Try downloading the video <a href={src} download className="font-semibold text-yellow-400 hover:text-yellow-200 underline">here</a>.
        </p>
      </video>
    </div>
  );
};