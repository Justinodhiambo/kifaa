
import React from 'react';
import FadeIn from './FadeIn';
import AnimatedGradient from './AnimatedGradient';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <AnimatedGradient />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn delay={0.1} duration={0.6}>
            <span className="inline-block py-1.5 px-4 rounded-full bg-kifaa-50 text-kifaa-800 text-sm font-medium mb-6">
              Redefining Financial Access
            </span>
          </FadeIn>
          
          <FadeIn delay={0.3} duration={0.6}>
            <h1 className="leading-tight mb-6">
              Unlock Your Financial Potential with <span className="gradient-text">AI-Driven</span> Financing
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.5} duration={0.6}>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Kifaa empowers you with smarter, faster, and more accessible financial services through AI-powered credit scoring and seamless wallet integration.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.7} duration={0.6}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="btn-primary w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 inline" />
              </button>
              <button className="btn-secondary w-full sm:w-auto">
                Learn More
              </button>
            </div>
          </FadeIn>
        </div>
        
        <FadeIn className="mt-16 md:mt-20 max-w-5xl mx-auto" delay={0.9} duration={0.8}>
          <div className="relative glass-card aspect-[16/9] overflow-hidden rounded-xl shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-kifaa-100/10 to-kifaa-50/10 backdrop-blur-xs"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 dark:bg-gray-900/90 max-w-xl rounded-xl p-8 shadow-soft">
                <div className="flex flex-col gap-4">
                  <div className="bg-kifaa-50 h-12 w-12 rounded-full flex items-center justify-center">
                    <span className="text-kifaa-800 text-xl font-bold">K</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6"></div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="h-20 bg-kifaa-50/50 rounded-lg"></div>
                    <div className="h-20 bg-blue-50/50 rounded-lg"></div>
                    <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <div className="h-10 w-32 bg-kifaa rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <div className="h-1.5 w-6 rounded-full bg-white opacity-50"></div>
            <div className="h-1.5 w-6 rounded-full bg-white"></div>
            <div className="h-1.5 w-6 rounded-full bg-white opacity-50"></div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Hero;
