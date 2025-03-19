
import React from 'react';
import { cn } from "@/lib/utils";

interface AnimatedGradientProps {
  className?: string;
  children?: React.ReactNode;
  subtle?: boolean;
}

const AnimatedGradient: React.FC<AnimatedGradientProps> = ({ 
  className,
  children,
  subtle = false
}) => {
  return (
    <div className={cn(
      "absolute inset-0 z-0 overflow-hidden pointer-events-none",
      className
    )}>
      <div className={cn(
        "light-mesh-gradient absolute -inset-[50%] z-0 animate-rotate-slow",
        subtle ? "opacity-30" : "opacity-60"
      )}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[50vh] w-[90vw] max-w-3xl rounded-full bg-gradient-to-r from-primary-400/60 via-primary/60 to-blue-400/60 blur-3xl animate-float" />
        <div className="absolute top-1/4 right-1/4 h-[30vh] w-[30vw] rounded-full bg-gradient-to-r from-primary-300/50 to-blue-500/50 blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/3 left-1/3 h-[25vh] w-[25vw] rounded-full bg-gradient-to-r from-blue-400/50 to-primary-400/50 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      {children}
    </div>
  );
};

export default AnimatedGradient;
