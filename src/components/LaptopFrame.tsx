
import React from 'react';

interface LaptopFrameProps {
  children: React.ReactNode;
  variant?: 'macbook' | 'windows';
}

const LaptopFrame = ({ children, variant = 'macbook' }: LaptopFrameProps) => {
  return (
    <div className="relative mx-auto my-8 max-w-5xl">
      {/* Laptop lid with screen */}
      <div className={`relative mx-auto rounded-t-xl ${variant === 'macbook' ? 'bg-gray-800' : 'bg-gray-700'} p-2 shadow-lg`}>
        {/* Camera/notch for MacBook */}
        {variant === 'macbook' && (
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 transform">
            <div className="h-1.5 w-20 rounded-b-lg bg-gray-700">
              <div className="absolute left-1/2 top-0.5 h-1 w-1 -translate-x-1/2 transform rounded-full bg-gray-600"></div>
            </div>
          </div>
        )}
        
        {/* Screen bezel */}
        <div className={`overflow-hidden rounded-lg border-8 ${variant === 'macbook' ? 'border-gray-700' : 'border-black'}`}>
          {/* Screen content with proper height to ensure visibility */}
          <div className={`bg-background rounded-sm ${variant === 'macbook' ? 'pt-4' : 'pt-2'}`} style={{ height: '70vh', maxHeight: '600px' }}>
            {children}
          </div>
        </div>
      </div>
      
      {/* Laptop base/keyboard section */}
      <div className={`mx-auto h-8 rounded-b-xl ${variant === 'macbook' ? 'bg-gray-700' : 'bg-gray-600'}`}>
        {/* Trackpad */}
        <div className="mx-auto mt-1 h-1 w-20 rounded-full bg-gray-600"></div>
      </div>
      
      {/* Laptop shadow */}
      <div className="absolute -bottom-3 left-1/2 h-1 w-[80%] -translate-x-1/2 transform rounded-full bg-black/20 blur-md"></div>
    </div>
  );
};

export default LaptopFrame;
