
import React from 'react';
import FadeIn from './FadeIn';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  UserPlus, 
  BarChart3, 
  Wallet, 
  TrendingUp 
} from 'lucide-react';

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
  return (
    <FadeIn delay={delay} direction="up" className="relative">
      <div className="glass-card p-6 md:p-8 hover-lift">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-shrink-0">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-medium relative">
              {icon}
              <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-background flex items-center justify-center text-xs font-medium">
                {number}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">{title}</h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

const HowItWorks: React.FC = () => {
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
      description: "Our AI analyzes your financial data to provide you with a personalized financing tier, taking into account your spending patterns and financial health.",
      icon: <BarChart3 className="h-6 w-6" />,
      delay: 0.3
    },
    {
      number: 3,
      title: "Access Financing",
      description: "Instantly receive funding options based on your eligibility. Choose the financing plan that works best for your needs and get approved quickly.",
      icon: <Wallet className="h-6 w-6" />,
      delay: 0.4
    },
    {
      number: 4,
      title: "Repay & Grow",
      description: "Build your financial profile and unlock even better financing terms over time. Timely repayments improve your Kifaa score for future financing.",
      icon: <TrendingUp className="h-6 w-6" />,
      delay: 0.5
    }
  ];

  return (
    <section id="how-it-works" className="section relative">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 px-3 py-1.5">Process</Badge>
          <h2 className="mb-4 text-4xl md:text-5xl font-semibold tracking-tight">
            How <span className="text-primary">Kifaa</span> Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our simple 4-step process makes accessing financial services easier than ever before.
          </p>
        </FadeIn>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute top-0 bottom-0 left-[27px] md:left-[31px] w-0.5 bg-primary/10"></div>
          
          <div className="space-y-8 md:space-y-12 relative">
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
                      value={step.number === 4 ? 100 : (step.number / 4) * 100} 
                      className="h-1.5 bg-primary/10" 
                    />
                  </div>
                </FadeIn>
              </div>
            ))}
          </div>
        </div>

        <FadeIn className="mt-20 text-center" delay={0.6}>
          <div className="inline-block rounded-xl px-8 py-6 text-white font-medium bg-gradient-to-r from-primary-900 to-primary-800 border border-primary-700/30 hover-lift">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </span>
              <span className="text-lg">Join Kifaa Today & Take Control of Your Financial Future!</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default HowItWorks;
