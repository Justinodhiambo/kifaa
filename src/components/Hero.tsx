
import React from 'react';
import FadeIn from './FadeIn';
import AnimatedGradient from './AnimatedGradient';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Smartphone } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <AnimatedGradient subtle={true} />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn delay={0.1} duration={0.6}>
            <div className="inline-block py-1.5 px-4 rounded-full bg-primary-900/10 text-primary-300 text-sm font-medium mb-6 border border-primary-700/20">
              <span className="flex items-center">
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> 
                Trusted by 10,000+ businesses
              </span>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.3} duration={0.6}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-sf leading-tight tracking-tight mb-6">
              Unlock Your Financial <br className="hidden md:inline" />
              <span className="text-gradient bg-gradient-to-r from-primary-300 via-primary to-blue-400">Potential</span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.5} duration={0.6}>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Kifaa empowers you with smarter, faster, and more accessible financial services through AI-powered solutions.
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
        
        <FadeIn className="mt-16 md:mt-20 max-w-6xl mx-auto" delay={0.9} duration={0.8}>
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Device Mockup */}
            <div className="relative z-10 lg:order-last mx-auto">
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative mx-auto w-[280px] h-[580px] bg-black rounded-[45px] shadow-apple overflow-hidden border-[8px] border-black">
                  {/* Status Bar */}
                  <div className="absolute top-0 inset-x-0 h-6 bg-black z-30">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-6 bg-black rounded-b-2xl"></div>
                  </div>
                  
                  {/* Phone Screen */}
                  <div className="h-full w-full overflow-hidden rounded-[32px] relative bg-gray-900">
                    {/* App UI */}
                    <div className="absolute inset-0 bg-background">
                      {/* App Header */}
                      <div className="h-14 flex items-center justify-between px-5 bg-gradient-to-r from-primary-900 to-primary-800">
                        <span className="text-white font-medium">Kifaa</span>
                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                          <span className="text-white text-xs">K</span>
                        </div>
                      </div>
                      
                      {/* App Content */}
                      <div className="p-5 space-y-4">
                        <div className="h-40 rounded-xl bg-primary-800/30 border border-primary-700/30 p-4 flex flex-col justify-between">
                          <div>
                            <div className="text-sm text-gray-400">Available Balance</div>
                            <div className="text-2xl font-bold text-white">$12,580.00</div>
                          </div>
                          <div className="flex space-x-2">
                            <div className="px-3 py-1 rounded-full bg-primary/20 text-primary-300 text-xs">Send</div>
                            <div className="px-3 py-1 rounded-full bg-primary/20 text-primary-300 text-xs">Deposit</div>
                            <div className="px-3 py-1 rounded-full bg-primary/20 text-primary-300 text-xs">Invest</div>
                          </div>
                        </div>
                        
                        <div className="text-sm font-medium text-white mb-2">Recent Transactions</div>
                        
                        {[1, 2, 3].map(item => (
                          <div key={item} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center mr-3">
                                <Smartphone className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">Device Finance</div>
                                <div className="text-xs text-gray-400">2 hours ago</div>
                              </div>
                            </div>
                            <div className="text-sm font-medium text-green-400">+$250.00</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reflection Overlay */}
                <div className="absolute top-[8px] left-[8px] right-[8px] h-[565px] bg-gradient-to-b from-white/10 to-transparent opacity-30 rounded-[32px] pointer-events-none"></div>
              </div>
            </div>
            
            {/* Text Content */}
            <div className="text-left space-y-6">
              <FadeIn delay={1.1} direction="left" className="bg-primary-900/10 border border-primary-700/20 rounded-xl p-6">
                <h3 className="text-2xl font-semibold mb-3">Smart Financial Management</h3>
                <p className="text-muted-foreground mb-4">Experience AI-driven insights that adapt to your spending habits and financial goals.</p>
                <div className="space-y-3">
                  {[
                    "Personalized financial recommendations",
                    "Real-time transaction monitoring",
                    "Automated saving strategies"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-[10px]">✓</span>
                      </div>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
              
              <FadeIn delay={1.3} direction="left">
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-10 w-10 rounded-full bg-primary-800 border-2 border-background flex items-center justify-center text-white text-xs">
                        {["JD", "TS", "AK"][i-1]}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Join 10,000+ users</div>
                    <div className="text-muted-foreground">and take control of your finances</div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Hero;
