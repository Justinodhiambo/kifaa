
import React from 'react';
import { cn } from "@/lib/utils";

interface AnimatedGradientProps {
  className?: string;
  children?: React.ReactNode;
}

const AnimatedGradient: React.FC<AnimatedGradientProps> = ({ 
  className,
  children 
}) => {
  return (
    <div className={cn(
      "absolute inset-0 z-0 overflow-hidden pointer-events-none",
      className
    )}>
      <div className="absolute -inset-[50%] z-0 opacity-20 animate-rotate-slow">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[50vh] w-[90vw] max-w-3xl rounded-full bg-gradient-to-r from-kifaa-800 via-blue-800 to-kifaa blur-3xl" />
        <div className="absolute top-1/4 right-1/4 h-[30vh] w-[30vw] rounded-full bg-gradient-to-r from-kifaa-600 to-blue-700 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 h-[25vh] w-[25vw] rounded-full bg-gradient-to-r from-blue-700 to-kifaa-800 blur-3xl" />
      </div>
      {children}
    </div>
  );
};

export default AnimatedGradient;
