
import React from 'react';
import FadeIn from './FadeIn';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  UserPlus, 
  BarChart3, 
  Wallet, 
  TrendingUp,
  Database,
  Globe 
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

const StepCard: React.FC<StepCardProps> = ({ 
  number, 
  title, 
  description, 
  icon, 
  delay 
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  return (
    <FadeIn delay={delay} direction="up" className="relative">
      <div className={cn(
        "p-6 md:p-8 hover-lift rounded-2xl shadow-sm",
        isDark ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700" : "bg-white border border-gray-100"
      )}>
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-shrink-0">
            <div className={cn(
              "h-14 w-14 rounded-2xl text-primary flex items-center justify-center text-xl font-medium relative",
              isDark ? "bg-primary-900/30 text-primary-400" : "bg-primary/10"
            )}>
              {icon}
              <div className={cn(
                "absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium",
                isDark ? "bg-primary-600 text-white" : "bg-primary text-background"
              )}>
                {number}
              </div>
            </div>
          </div>
          <div>
            <h3 className={cn(
              "text-xl font-semibold mb-3",
              isDark ? "text-white" : "text-gray-900"
            )}>{title}</h3>
            <p className={cn(
              "text-sm md:text-base leading-relaxed",
              isDark ? "text-gray-300" : "text-muted-foreground"
            )}>{description}</p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

const HowItWorks: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const steps = [
    {
      number: 1,
      title: "Sign Up & Connect",
      description: "Create a Kifaa account and link your preferred payment method. We support M-Pesa, Airtel Money, bank transfers, and cryptocurrency.",
      icon: <UserPlus className="h-6 w-6" />,
      delay: 0.2
    },
    {
      number: 2,
      title: "Get Assessed",
      description: "Our AI analyzes your financial data to provide a personalized risk profile, which our banking partners use to offer you appropriate financing options.",
      icon: <BarChart3 className="h-6 w-6" />,
      delay: 0.3
    },
    {
      number: 3,
      title: "Access Financing",
      description: "Our partner financial institutions provide funding options based on your Kifaa score. Choose the plan that works best for your needs.",
      icon: <Wallet className="h-6 w-6" />,
      delay: 0.4
    },
    {
      number: 4,
      title: "Repay & Grow",
      description: "Build your financial profile and unlock even better financing terms over time. Timely repayments improve your Kifaa score for future opportunities.",
      icon: <TrendingUp className="h-6 w-6" />,
      delay: 0.5
    },
    {
      number: 5,
      title: "Secure Data Management",
      description: "Your financial data is securely stored and processed using advanced encryption, ensuring privacy while powering our AI risk assessment.",
      icon: <Database className="h-6 w-6" />,
      delay: 0.6
    },
    {
      number: 6,
      title: "Cross-Border Transactions",
      description: "Access seamless international payments through our blockchain infrastructure, enabling global business opportunities with minimal fees.",
      icon: <Globe className="h-6 w-6" />,
      delay: 0.7
    }
  ];

  return (
    <section id="how-it-works" className={cn(
      "section relative py-20 px-6",
      isDark ? "bg-gray-900/80 backdrop-blur-sm" : "bg-white"
    )}>
      {/* Add an invisible anchor element at the top of the section for better scroll targeting */}
      <div id="how-it-works-anchor" className="absolute" style={{ top: '-100px' }}></div>
      
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 px-3 py-1.5 rounded-full">Process</Badge>
          <h2 className={cn(
            "mb-4 text-4xl md:text-5xl font-semibold tracking-tight",
            isDark ? "text-white" : "text-gray-900"
          )}>
            How <span className="text-gradient-primary">Kifaa</span> Works
          </h2>
          <p className={cn(
            "text-lg max-w-2xl mx-auto",
            isDark ? "text-gray-300" : "text-muted-foreground"
          )}>
            Our simple process makes accessing financial services easier than ever before.
          </p>
        </FadeIn>

        <div className="relative max-w-5xl mx-auto">
          <div className={cn(
            "absolute top-0 bottom-0 left-[27px] md:left-[31px] w-0.5",
            isDark ? "bg-primary-700/30" : "bg-primary/10"
          )}></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <StepCard
                  number={step.number}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                  delay={step.delay}
                />
                
                <FadeIn delay={step.delay + 0.1}>
                  <div className="mt-4 pl-[54px] md:pl-[62px]">
                    <Progress 
                      value={step.number === 6 ? 100 : (step.number / 6) * 100} 
                      className={cn(
                        "h-1.5",
                        isDark ? "bg-gray-700" : "bg-primary/10"
                      )} 
                    />
                  </div>
                </FadeIn>
              </div>
            ))}
          </div>
        </div>

        <FadeIn className="mt-20 text-center" delay={0.8}>
          <div className={cn(
            "inline-flex items-center gap-3 rounded-xl px-8 py-6 font-medium border hover-lift",
            isDark 
              ? "bg-gradient-to-r from-primary-900 to-primary-800 border-primary-700/30 text-white" 
              : "bg-gradient-to-r from-primary-600 to-primary-500 border-primary-400/30 text-white"
          )}>
            <span className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="text-lg">Join Kifaa Today & Access Smarter Financing!</span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default HowItWorks;
