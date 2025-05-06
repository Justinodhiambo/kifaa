
import React, { useState, useEffect } from 'react';
import FadeIn from './FadeIn';
import AnimatedGradient from './AnimatedGradient';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Smartphone, Shield, LineChart, CreditCard, Hexagon, Zap, Clock, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import ImageGallery from './ImageGallery';

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
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-white">
      <AnimatedGradient subtle={true} />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn delay={0.1} duration={0.6}>
            <div className="inline-block py-1.5 px-4 rounded-full text-sm font-medium mb-6 transition-all hover:scale-105 border bg-white/80 backdrop-blur-sm text-primary-700 border-primary-100 shadow-sm">
              <span className="flex items-center">
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> 
                Trusted by 10,000+ businesses across East Africa
              </span>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.3} duration={0.6}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-sf font-bold leading-tight tracking-tight mb-6 text-gray-900">
              Your Financial <br className="hidden md:inline" />
              <span className="text-gradient-primary">Freedom Partner</span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.5} duration={0.6}>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-muted-foreground">
              Seamlessly connect to affordable financing through intelligent risk assessment, empowering your financial journey.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.7} duration={0.6}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="w-full sm:w-auto text-base group rounded-full py-6" size="lg">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 inline group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="w-full sm:w-auto text-base rounded-full py-6" size="lg">
                See How It Works
              </Button>
            </div>
          </FadeIn>
        </div>
        
        <FadeIn className="mt-16 md:mt-20 max-w-6xl mx-auto" delay={0.9} duration={0.8}>
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Modern Dashboard UI instead of phone */}
            <div className="relative z-10 lg:order-last mx-auto">
              <div className="relative transform scale-[0.8] sm:scale-[0.85] md:scale-90 lg:scale-100">
                {/* Browser/Dashboard Frame */}
                <div className="relative mx-auto w-[360px] sm:w-[500px] rounded-xl shadow-apple overflow-hidden border-8 bg-white border-gray-100">
                  {/* Browser Header */}
                  <div className="h-10 flex items-center px-3 border-b bg-gray-50 border-gray-200">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mx-auto text-xs px-4 py-1 rounded-full bg-gray-100 text-gray-600">
                      kifaa.io
                    </div>
                  </div>
                  
                  {/* Dashboard UI */}
                  <div className="p-6 h-[400px] overflow-hidden bg-white">
                    {/* Dashboard Header with Logo */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center relative mr-3 bg-primary-50">
                          <div className="relative z-10 flex items-center justify-center">
                            <Hexagon className="h-6 w-6 text-primary-600" strokeWidth={1.5} />
                            <Zap className="h-3.5 w-3.5 absolute text-primary-600" strokeWidth={2} />
                          </div>
                        </div>
                        <span className="text-xl font-semibold text-gray-900">
                          Kifaa Dashboard
                        </span>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-gray-100">
                        <div className="h-full w-full rounded-full flex items-center justify-center">
                          <img 
                            src="/lovable-uploads/92c8ab6b-e20f-4189-b055-bfea5ce6e47a.png" 
                            alt="User avatar" 
                            className="h-full w-full object-cover rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Main Dashboard Content */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {/* Available Balance Card */}
                      <div className="md:col-span-2">
                        <div className="h-36 rounded-xl p-4 flex flex-col justify-between shadow-sm bg-gradient-to-br from-primary-600 to-primary-500">
                          <div>
                            <div className="text-xs text-white/80 font-medium">Available Balance</div>
                            <div className="text-2xl font-bold text-white mt-1">{formatCurrency(balance)}</div>
                            <div className="text-xs text-white/70 mt-1">+KES 245,600 this month</div>
                          </div>
                          <div className="flex space-x-2">
                            <div className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">Send</div>
                            <div className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">Top Up</div>
                            <div className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">Finance</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Credit Score Card */}
                      <div>
                        <div className="h-36 rounded-xl p-4 flex flex-col justify-between shadow-sm bg-gray-50 border border-gray-200">
                          <div>
                            <div className="text-xs font-medium text-gray-500">Kifaa Score</div>
                            <div className="mt-2 text-3xl font-bold text-gray-900">728</div>
                            <div className="text-xs mt-1 text-green-600">+15 points this month</div>
                          </div>
                          <div className="w-full h-1.5 rounded-full overflow-hidden bg-gray-200">
                            <div className="h-full w-[72%] bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent Transactions */}
                    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
                      <div className="px-4 py-3 flex justify-between items-center bg-gray-50">
                        <div className="text-sm font-medium text-gray-800">Recent Activity</div>
                        <div className="text-xs text-primary-600">View All</div>
                      </div>
                      
                      <div className="divide-y overflow-hidden divide-gray-100 bg-white">
                        {transactions.slice(0, 3).map((item, index) => (
                          <div 
                            key={index} 
                            className={cn(
                              "flex items-center justify-between p-3 transition-all duration-300",
                              activeTransaction === index ? "bg-gray-50" : "",
                              "cursor-pointer hover:bg-gray-50"
                            )}
                          >
                            <div className="flex items-center">
                              <div className={`h-8 w-8 rounded-lg ${item.color} flex items-center justify-center mr-3 flex-shrink-0`}>
                                {item.icon}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">{item.title}</div>
                                <div className="text-xs text-gray-500">{item.time}</div>
                              </div>
                            </div>
                            <div className={`text-sm font-medium ${
                              item.isPositive ? 'text-green-600' : (item.amount ? 'text-red-600' : 'text-emerald-600')
                            }`}>
                              {item.amount && (item.isPositive ? '+' : '')}
                              {item.amount && `KES ${item.amount}`}
                              {!item.amount && <span className="text-emerald-600">✓ Complete</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shadow under dashboard */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-[15px] bg-black/20 blur-xl rounded-full"></div>
              </div>
            </div>
            
            {/* Text Content */}
            <div className="text-left space-y-6">
              <FadeIn delay={1.1} direction="left" className="rounded-xl p-7 border shadow-sm bg-white border-gray-100">
                <h3 className="text-2xl font-semibold mb-3 text-gray-900">Smart Financial Decisions</h3>
                <p className="mb-4 text-muted-foreground">AI-driven insights connect you to financing options tailored to your financial potential, not just your past.</p>
                <div className="space-y-3">
                  {[
                    "Personalized risk assessment",
                    "No traditional credit history needed",
                    "Affordable repayment plans"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="mt-1 h-5 w-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0 bg-primary-50 text-primary-600">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
              
              <FadeIn delay={1.3} direction="left">
                <div className="flex items-center p-4 rounded-xl border bg-gray-50/80 backdrop-blur-sm border-gray-100">
                  <div className="flex -space-x-3">
                    <div className="h-10 w-10 rounded-full bg-white border-2 border-white flex items-center justify-center text-gray-700 text-xs font-medium overflow-hidden shadow-sm">
                      <img 
                        src="/lovable-uploads/29429bf4-4ba8-4306-83bd-297c2b454e09.png" 
                        alt="User avatar" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white border-2 border-white flex items-center justify-center text-gray-700 text-xs font-medium overflow-hidden shadow-sm">
                      <img 
                        src="/lovable-uploads/92c8ab6b-e20f-4189-b055-bfea5ce6e47a.png" 
                        alt="User avatar" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white border-2 border-white flex items-center justify-center text-gray-700 text-xs font-medium overflow-hidden shadow-sm">
                      <img 
                        src="/lovable-uploads/956bbafa-853c-45b0-a85b-59bd1daf04a1.png" 
                        alt="User avatar" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white border-2 border-white flex items-center justify-center text-gray-700 text-xs font-medium overflow-hidden shadow-sm">
                      <img 
                        src="/lovable-uploads/469f84d9-2724-4370-8329-ea06835f5ebc.png" 
                        alt="User avatar" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium bg-primary-50 text-primary-600">
                      +8k
                    </div>
                  </div>
                  <div className="text-sm ml-3">
                    <div className="font-medium text-gray-800">Join thousands of users</div>
                    <div className="text-xs text-gray-500">accessing affordable financing today</div>
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
