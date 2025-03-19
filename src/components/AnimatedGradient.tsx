
import React from 'react';
import { cn } from "@/lib/utils";
import { useTheme } from './ThemeProvider';

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={cn(
      "absolute inset-0 z-0 overflow-hidden pointer-events-none",
      className
    )}>
      <div className={cn(
        isDark ? "dark-mesh-gradient" : "light-mesh-gradient", 
        "absolute -inset-[50%] z-0 animate-rotate-slow",
        subtle ? "opacity-30" : "opacity-60"
      )}>
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[50vh] w-[90vw] max-w-3xl rounded-full blur-3xl animate-float",
          isDark ? 
            "bg-gradient-to-r from-primary-400/40 via-primary/40 to-blue-400/40" : 
            "bg-gradient-to-r from-primary-400/60 via-primary/60 to-blue-400/60"
        )} />
        <div className={cn(
          "absolute top-1/4 right-1/4 h-[30vh] w-[30vw] rounded-full blur-3xl animate-pulse-soft",
          isDark ? 
            "bg-gradient-to-r from-primary-300/30 to-blue-500/30" : 
            "bg-gradient-to-r from-primary-300/50 to-blue-500/50"
        )} />
        <div className={cn(
          "absolute bottom-1/3 left-1/3 h-[25vh] w-[25vw] rounded-full blur-3xl animate-float",
          isDark ? 
            "bg-gradient-to-r from-blue-400/30 to-primary-400/30" : 
            "bg-gradient-to-r from-blue-400/50 to-primary-400/50"
        )} style={{ animationDelay: '2s' }} />
      </div>
      {children}
    </div>
  );
};

export default AnimatedGradient;
