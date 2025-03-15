
import React from 'react';
import FadeIn from './FadeIn';
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
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-start gap-6 hover-lift">
        <div className="flex-shrink-0">
          <div className="h-16 w-16 rounded-full bg-kifaa-50 text-kifaa-800 flex items-center justify-center text-2xl font-bold relative">
            {icon}
            <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-kifaa text-white flex items-center justify-center text-xs font-bold">
              {number}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
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
    <section id="how-it-works" className="section bg-secondary/50">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <h2 className="mb-4">How <span className="text-kifaa">Kifaa</span> Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our simple 4-step process makes accessing financial services easier than ever before.
          </p>
        </FadeIn>

        <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
          {steps.map((step) => (
            <StepCard
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              icon={step.icon}
              delay={step.delay}
            />
          ))}
        </div>

        <FadeIn className="mt-16 text-center" delay={0.6}>
          <div className="inline-block bg-kifaa-50 rounded-full px-6 py-3 text-kifaa-800 font-medium">
            🚀 Join Kifaa Today & Take Control of Your Financial Future!
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default HowItWorks;
