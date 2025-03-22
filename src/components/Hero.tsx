
import React, { useState, useEffect } from 'react';
import FadeIn from './FadeIn';
import AnimatedGradient from './AnimatedGradient';
import { Button } from "@/components/ui/button";
import { useTheme } from './ThemeProvider';
import { ArrowRight, CheckCircle, Smartphone, Shield, LineChart, CreditCard, Hexagon, Zap, Clock, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// Updated transactions to align with Kifaa's business model
const transactions = [
  { 
    icon: <Smartphone className="h-5 w-5 text-white" />, 
    title: "Smartphone financing approved", 
    time: "2 hours ago", 
    amount: "-18,000", 
    color: "bg-green-500",
    isPositive: false
  },
  { 
    icon: <Shield className="h-5 w-5 text-white" />, 
    title: "Repayment #2 for Motorbike", 
    time: "Yesterday", 
    amount: "-3,500", 
    color: "bg-blue-500",
    isPositive: false
  },
  { 
    icon: <AlertCircle className="h-5 w-5 text-white" />, 
    title: "Late fee charged", 
    time: "Jan 13", 
    amount: "-200", 
    color: "bg-amber-500",
    isPositive: false
  },
  { 
    icon: <Clock className="h-5 w-5 text-white" />, 
    title: "TV fully paid off", 
    time: "Jan 12", 
    amount: "", 
    color: "bg-purple-500",
    isPositive: true
  },
  { 
    icon: <LineChart className="h-5 w-5 text-white" />, 
    title: "M-Pesa top-up", 
    time: "Jan 10", 
    amount: "+5,000", 
    color: "bg-indigo-500",
    isPositive: true
  },
  { 
    icon: <CreditCard className="h-5 w-5 text-white" />, 
    title: "Referral reward credited", 
    time: "Jan 8", 
    amount: "+300", 
    color: "bg-teal-500",
    isPositive: true
  },
];

const Hero: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isMobile = useIsMobile();
  const [activeTransaction, setActiveTransaction] = useState(0);
  const [balance, setBalance] = useState(125800.00);

  // Simulate interactive transactions
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTransaction((prev) => (prev + 1) % transactions.length);
      
      // Randomly adjust balance slightly to create a "live" effect
      setBalance(prev => {
        const adjustment = Math.random() * 1000 - 500; // Random adjustment between -500 and +500
        return Math.round((prev + adjustment) * 100) / 100;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Format currency in KSH
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <section className={cn(
      "relative min-h-screen flex items-center justify-center pt-20 overflow-hidden",
      isDark ? "bg-gray-950" : "bg-white"
    )}>
      <AnimatedGradient subtle={true} />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn delay={0.1} duration={0.6}>
            <div className="inline-block py-1.5 px-4 rounded-full text-sm font-medium mb-6 transition-all hover:scale-105 border bg-white/80 backdrop-blur-sm text-primary-700 border-primary-100 shadow-sm dark:bg-gray-800/80 dark:text-primary-400 dark:border-gray-700">
              <span className="flex items-center">
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> 
                Trusted by 10,000+ businesses across East Africa
              </span>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.3} duration={0.6}>
            <h1 className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-sf font-bold leading-tight tracking-tight mb-6",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Your Financial <br className="hidden md:inline" />
              <span className="text-gradient-primary">Freedom Partner</span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.5} duration={0.6}>
            <p className={cn(
              "text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed",
              isDark ? "text-gray-400" : "text-muted-foreground"
            )}>
              Seamlessly connect to affordable financing through intelligent risk assessment, empowering your financial journey.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.7} duration={0.6}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="w-full sm:w-auto text-base group rounded-full py-6" size="lg">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 inline group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant={isDark ? "secondary" : "outline"} className="w-full sm:w-auto text-base rounded-full py-6" size="lg">
                See How It Works
              </Button>
            </div>
          </FadeIn>
        </div>
        
        <FadeIn className="mt-16 md:mt-20 max-w-6xl mx-auto" delay={0.9} duration={0.8}>
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Device Mockup with more modern fintech styling */}
            <div className="relative z-10 lg:order-last mx-auto">
              <div className="relative transform scale-[0.85] md:scale-95">
                {/* Phone Frame - more modern and sleek */}
                <div className={cn(
                  "relative mx-auto w-[280px] h-[580px] rounded-[40px] shadow-apple overflow-hidden border-[10px]",
                  isDark ? "bg-gray-900 border-gray-800" : "bg-gray-950 border-gray-900"
                )}>
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-6 bg-black z-30 rounded-b-2xl"></div>
                  
                  {/* Speaker */}
                  <div className="absolute top-[8px] left-1/2 transform -translate-x-1/2 w-[40px] h-[4px] bg-gray-700 rounded-full z-30"></div>
                  
                  {/* Camera */}
                  <div className="absolute top-[8px] right-[80px] w-[8px] h-[8px] bg-gray-700 rounded-full z-30 flex items-center justify-center">
                    <div className="w-[4px] h-[4px] bg-gray-600 rounded-full"></div>
                  </div>
                  
                  {/* Phone Screen */}
                  <div className="h-full w-full overflow-hidden rounded-[30px] relative bg-white">
                    {/* App UI - more modern, stripe/wise inspired UI */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white">
                      {/* App Header */}
                      <div className="h-16 flex items-center justify-between px-4 bg-gradient-to-r from-primary-600 to-primary-500">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center mr-2 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-primary opacity-20"></div>
                            <div className="relative z-10 flex items-center justify-center">
                              <Hexagon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                              <Zap className="h-3 w-3 text-primary absolute" strokeWidth={2.5} />
                            </div>
                          </div>
                          <span className="text-white font-semibold text-base">Kifaa</span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5"/>
                            <path d="M12 8V12L15 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      
                      {/* App Content - cleaner, more modern layout */}
                      <div className="p-4 space-y-4">
                        <div 
                          className="h-36 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 shadow-lg p-4 flex flex-col justify-between transition-all duration-300 ease-in-out"
                        >
                          <div>
                            <div className="text-xs text-white/80 font-medium">Available Balance</div>
                            <div className="text-2xl font-bold text-white mt-1">{formatCurrency(balance)}</div>
                            <div className="text-xs text-white/70 mt-1">+KES 245,600 this month</div>
                          </div>
                          <div className="flex space-x-2">
                            <div className="px-3 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-medium backdrop-blur-sm">Send</div>
                            <div className="px-3 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-medium backdrop-blur-sm">Deposit</div>
                            <div className="px-3 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-medium backdrop-blur-sm">Invest</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-xs font-semibold text-gray-800">Recent Activity</div>
                          <div className="text-[10px] text-primary-600 font-medium">View All</div>
                        </div>
                        
                        {transactions.map((item, index) => (
                          <div 
                            key={index} 
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border transition-all duration-300",
                              activeTransaction === index ? 
                                "bg-white shadow-md scale-[1.02] border-gray-200" : 
                                "bg-gray-50 border-gray-100",
                              "cursor-pointer hover:bg-white hover:shadow-sm"
                            )}
                            onClick={() => setActiveTransaction(index)}
                          >
                            <div className="flex items-center">
                              <div className={`h-8 w-8 rounded-full ${item.color} flex items-center justify-center mr-3`}>
                                {item.icon}
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-800">{item.title}</div>
                                <div className="text-[10px] text-gray-500">{item.time}</div>
                              </div>
                            </div>
                            <div className={`text-xs font-medium ${item.isPositive ? 'text-green-600' : 'text-gray-800'}`}>
                              {item.amount && (item.isPositive ? '+' : '')}
                              {item.amount && `KES ${item.amount}`}
                              {!item.amount && <span className="text-emerald-600">✓ Complete</span>}
                            </div>
                          </div>
                        ))}
                        
                        <div className="bg-white rounded-lg p-3 mt-2 border border-gray-200 shadow-sm">
                          <div className="text-xs font-medium text-gray-800 mb-2">Upcoming Payment</div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center mr-3">
                                <Smartphone className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-800">Laptop Financing</div>
                                <div className="text-[10px] text-gray-500">Due in 3 days</div>
                              </div>
                            </div>
                            <div className="text-xs font-medium text-gray-800">KES 4,500</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reflection Overlay */}
                <div className="absolute top-[10px] left-[10px] right-[10px] h-[560px] rounded-[30px] pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent opacity-60"></div>
                </div>
                
                {/* Shadow under phone */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-[200px] h-[15px] bg-black/20 blur-xl rounded-full"></div>
              </div>
            </div>
            
            {/* Text Content - more modern fintech style */}
            <div className="text-left space-y-6">
              <FadeIn delay={1.1} direction="left" className={cn(
                "rounded-xl p-7 border shadow-sm",
                isDark ? "bg-gray-800/80 backdrop-blur-sm border-gray-700" : "bg-white border-gray-100"
              )}>
                <h3 className={cn(
                  "text-2xl font-semibold mb-3",
                  isDark ? "text-white" : "text-gray-900"
                )}>Smart Financial Decisions</h3>
                <p className={cn(
                  "mb-4",
                  isDark ? "text-gray-300" : "text-muted-foreground"
                )}>AI-driven insights connect you to financing options tailored to your financial potential, not just your past.</p>
                <div className="space-y-3">
                  {[
                    "Personalized risk assessment",
                    "No traditional credit history needed",
                    "Affordable repayment plans"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className={cn(
                        "mt-1 h-5 w-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0",
                        isDark ? "bg-primary-900/30 text-primary-400" : "bg-primary-50 text-primary-600"
                      )}>
                        <CheckCircle className="h-3 w-3" />
                      </div>
                      <span className={cn(
                        "text-sm",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}>{item}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
              
              <FadeIn delay={1.3} direction="left">
                <div className={cn(
                  "flex items-center p-4 rounded-xl border",
                  isDark ? "bg-gray-800/80 backdrop-blur-sm border-gray-700" : "bg-gray-50/80 backdrop-blur-sm border-gray-100"
                )}>
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-10 w-10 rounded-full bg-white border-2 border-white flex items-center justify-center text-gray-700 text-xs font-medium overflow-hidden shadow-sm">
                        <img 
                          src={`https://randomuser.me/api/portraits/women/${i + 20}.jpg`} 
                          alt="User avatar" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                    <div className={cn(
                      "h-10 w-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium",
                      isDark ? "bg-primary-900/70 text-primary-400" : "bg-primary-50 text-primary-600"
                    )}>
                      +8k
                    </div>
                  </div>
                  <div className="text-sm ml-3">
                    <div className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-800"
                    )}>Join thousands of users</div>
                    <div className={cn(
                      "text-xs",
                      isDark ? "text-gray-300" : "text-gray-500"
                    )}>accessing affordable financing today</div>
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
