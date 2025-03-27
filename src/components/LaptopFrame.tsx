
import React from 'react';

interface LaptopFrameProps {
  children: React.ReactNode;
  variant?: 'macbook' | 'windows';
}

const LaptopFrame = ({ children, variant = 'macbook' }: LaptopFrameProps) => {
  // Styles that change based on laptop variant
  const laptopStyles = {
    lid: variant === 'macbook' 
      ? "bg-gray-800 rounded-t-xl" 
      : "bg-gray-700 rounded-t-lg",
    bezel: variant === 'macbook' 
      ? "border-8 border-gray-700 rounded-lg" 
      : "border-12 border-gray-600 rounded-md",
    keyboard: variant === 'macbook' 
      ? "bg-gray-700 rounded-b-xl" 
      : "bg-gray-600 rounded-b-lg",
    trackpad: variant === 'macbook' 
      ? "bg-gray-600 rounded-full" 
      : "bg-gray-500 rounded-md"
  };

  return (
    <div className="relative mx-auto my-8 max-w-5xl">
      {/* Laptop lid with screen */}
      <div className={`relative mx-auto p-2 shadow-lg ${laptopStyles.lid}`}>
        {/* Camera/notch */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 transform">
          <div className="h-1.5 w-20 rounded-b-lg bg-gray-700">
            <div className="absolute left-1/2 top-0.5 h-1 w-1 -translate-x-1/2 transform rounded-full bg-gray-600"></div>
          </div>
        </div>
        
        {/* Screen bezel */}
        <div className={`overflow-hidden ${laptopStyles.bezel}`}>
          {/* Screen content with proper height to ensure visibility */}
          <div className="bg-background rounded-sm pt-4" style={{ height: '70vh', maxHeight: '600px' }}>
            {children}
          </div>
        </div>
      </div>
      
      {/* Laptop base/keyboard section */}
      <div className={`mx-auto h-8 ${laptopStyles.keyboard}`}>
        {/* Trackpad */}
        <div className={`mx-auto mt-1 h-1 w-20 ${laptopStyles.trackpad}`}></div>
      </div>
      
      {/* Laptop shadow */}
      <div className="absolute -bottom-3 left-1/2 h-1 w-[80%] -translate-x-1/2 transform rounded-full bg-black/20 blur-md"></div>
    </div>
  );
};

export default LaptopFrame;
