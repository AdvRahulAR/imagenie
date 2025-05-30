
import React from 'react';

interface ApiKeyStatusBannerProps {
  className?: string;
  errorText?: string | null;
}

export const ApiKeyStatusBanner: React.FC<ApiKeyStatusBannerProps> = ({ className, errorText }) => {
  const displayMessage = errorText || 
    `The API_KEY environment variable is not set. 
    Image generation and content creation functionality will not work without it. 
    Please ensure it's configured in your environment.`;

  return (
    <div className={`w-full max-w-3xl mb-6 p-4 bg-amber-500 border-l-4 border-amber-700 text-slate-900 rounded-md shadow-lg ${className || ''}`} role="alert">
      <div className="flex">
        <div className="py-1">
          <svg className="fill-current h-6 w-6 text-slate-800 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-slate-800">Configuration Issue</p>
          <p className="text-sm text-slate-700 whitespace-pre-line">
            {displayMessage}
          </p>
        </div>
      </div>
    </div>
  );
};
