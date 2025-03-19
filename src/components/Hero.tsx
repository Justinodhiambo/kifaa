
import React from 'react';
import FadeIn from './FadeIn';
import AnimatedGradient from './AnimatedGradient';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Smartphone, Shield, LineChart, CreditCard } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <AnimatedGradient subtle={true} />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn delay={0.1} duration={0.6}>
            <div className="inline-block py-1.5 px-4 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6 border border-primary-100">
              <span className="flex items-center">
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> 
                Trusted by 10,000+ businesses
              </span>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.3} duration={0.6}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-sf font-bold leading-tight tracking-tight mb-6 text-gray-900">
              Unlock Your Financial <br className="hidden md:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary to-blue-500">Potential</span>
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
              <div className="relative transform scale-90 md:scale-100">
                {/* Phone Frame */}
                <div className="relative mx-auto w-[320px] h-[650px] bg-gray-800 rounded-[45px] shadow-apple overflow-hidden border-[11px] border-gray-800">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[160px] h-7 bg-gray-800 z-30 rounded-b-3xl"></div>
                  
                  {/* Speaker */}
                  <div className="absolute top-[10px] left-1/2 transform -translate-x-1/2 w-[60px] h-[6px] bg-gray-900 rounded-full z-30"></div>
                  
                  {/* Camera */}
                  <div className="absolute top-[10px] right-[95px] w-[12px] h-[12px] bg-gray-900 rounded-full z-30 flex items-center justify-center">
                    <div className="w-[6px] h-[6px] bg-gray-700 rounded-full"></div>
                  </div>
                  
                  {/* Phone Screen */}
                  <div className="h-full w-full overflow-hidden rounded-[32px] relative bg-white">
                    {/* App UI */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white">
                      {/* App Header */}
                      <div className="h-16 flex items-center justify-between px-5 bg-gradient-to-r from-primary-600 to-primary-500">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center mr-3">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L6 7V16L12 21L18 16V7L12 2Z" fill="#0072FF" stroke="#0072FF" strokeWidth="1.5"/>
                              <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <span className="text-white font-semibold text-lg">Kifaa</span>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5"/>
                            <path d="M12 8V12L15 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      
                      {/* App Content */}
                      <div className="p-5 space-y-5">
                        <div className="h-44 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 shadow-lg border border-primary-400/20 p-5 flex flex-col justify-between">
                          <div>
                            <div className="text-sm text-white/80">Available Balance</div>
                            <div className="text-3xl font-bold text-white mt-1">$12,580.00</div>
                            <div className="text-xs text-white/70 mt-1">+$2,456.00 this month</div>
                          </div>
                          <div className="flex space-x-2">
                            <div className="px-4 py-2 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">Send</div>
                            <div className="px-4 py-2 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">Deposit</div>
                            <div className="px-4 py-2 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">Invest</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-semibold text-gray-800">Recent Transactions</div>
                          <div className="text-xs text-primary-600 font-medium">View All</div>
                        </div>
                        
                        {[
                          { icon: <CreditCard className="h-5 w-5 text-white" />, title: "Netflix Subscription", time: "2 hours ago", amount: "-$15.99", color: "bg-red-500" },
                          { icon: <Shield className="h-5 w-5 text-white" />, title: "Insurance Payment", time: "Yesterday", amount: "-$85.40", color: "bg-green-500" },
                          { icon: <LineChart className="h-5 w-5 text-white" />, title: "Investment Return", time: "Jan 12", amount: "+$250.00", color: "bg-blue-500" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm">
                            <div className="flex items-center">
                              <div className={`h-10 w-10 rounded-full ${item.color} flex items-center justify-center mr-3`}>
                                {item.icon}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">{item.title}</div>
                                <div className="text-xs text-gray-500">{item.time}</div>
                              </div>
                            </div>
                            <div className={`text-sm font-medium ${item.amount.startsWith('+') ? 'text-green-600' : 'text-gray-800'}`}>{item.amount}</div>
                          </div>
                        ))}
                        
                        <div className="bg-gray-50 rounded-xl p-4 mt-3 border border-gray-100">
                          <div className="text-sm font-medium text-gray-800 mb-2">Upcoming Payment</div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center mr-3">
                                <Smartphone className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">Phone Bill</div>
                                <div className="text-xs text-gray-500">Due in 3 days</div>
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-800">$45.00</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reflection Overlay */}
                <div className="absolute top-[11px] left-[11px] right-[11px] h-[628px] rounded-[32px] pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent opacity-60"></div>
                </div>
                
                {/* Shadow under phone */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-[240px] h-[20px] bg-black/10 blur-xl rounded-full"></div>
              </div>
            </div>
            
            {/* Text Content */}
            <div className="text-left space-y-6">
              <FadeIn delay={1.1} direction="left" className="bg-white rounded-xl p-7 border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-semibold mb-3 text-gray-900">Smart Financial Management</h3>
                <p className="text-muted-foreground mb-4">Experience AI-driven insights that adapt to your spending habits and financial goals.</p>
                <div className="space-y-3">
                  {[
                    "Personalized financial recommendations",
                    "Real-time transaction monitoring",
                    "Automated saving strategies"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="mt-1 h-5 w-5 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center mr-3 flex-shrink-0">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
              
              <FadeIn delay={1.3} direction="left">
                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
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
                    <div className="h-10 w-10 rounded-full bg-primary-50 border-2 border-white flex items-center justify-center text-primary-600 text-xs font-medium">
                      +8k
                    </div>
                  </div>
                  <div className="text-sm ml-3">
                    <div className="font-medium text-gray-800">Join 10,000+ users</div>
                    <div className="text-gray-500 text-xs">and take control of your finances</div>
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
