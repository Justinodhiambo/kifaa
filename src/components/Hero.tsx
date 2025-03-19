
import React from 'react';
import FadeIn from './FadeIn';
import AnimatedGradient from './AnimatedGradient';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <AnimatedGradient />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn delay={0.1} duration={0.6}>
            <div className="inline-block py-1.5 px-4 rounded-full bg-primary-900/20 text-primary-300 text-sm font-medium mb-6 border border-primary-700/30">
              <span className="flex items-center">
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> 
                Trusted by 10,000+ businesses
              </span>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.3} duration={0.6}>
            <h1 className="leading-tight mb-6">
              Unlock Your Financial Potential with <span className="text-gradient bg-gradient-to-r from-primary-300 to-primary">AI-Driven</span> Financing
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.5} duration={0.6}>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Kifaa empowers you with smarter, faster, and more accessible financial services through AI-powered credit scoring and seamless wallet integration.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.7} duration={0.6}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="w-full sm:w-auto text-base group" size="lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 inline group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="w-full sm:w-auto text-base" size="lg">
                Learn More
              </Button>
            </div>
          </FadeIn>
        </div>
        
        <FadeIn className="mt-16 md:mt-20 max-w-5xl mx-auto" delay={0.9} duration={0.8}>
          <div className="relative glass-card aspect-[16/9] overflow-hidden rounded-xl shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-background/20 backdrop-blur-xs"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-secondary/90 max-w-xl rounded-xl p-8 shadow-soft border border-border/40">
                <div className="flex flex-col gap-4">
                  <div className="bg-primary h-12 w-12 rounded-full flex items-center justify-center border border-primary-700">
                    <span className="text-white text-xl font-bold">K</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-accent rounded-full w-3/4"></div>
                    <div className="h-2 bg-accent rounded-full"></div>
                    <div className="h-2 bg-accent rounded-full w-5/6"></div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="h-20 bg-primary/10 rounded-lg border border-primary/30"></div>
                    <div className="h-20 bg-blue-900/30 rounded-lg border border-blue-800/20"></div>
                    <div className="h-20 bg-accent/80 rounded-lg border border-accent/50"></div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <div className="h-10 w-32 bg-primary rounded-full"></div>
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
