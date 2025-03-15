
import React from 'react';
import FadeIn from './FadeIn';
import { 
  Brain, 
  Wallet, 
  CreditCard, 
  Layers, 
  Smartphone 
} from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon, 
  delay 
}) => {
  return (
    <FadeIn delay={delay} className="hover-lift">
      <div className="glass-card p-6 md:p-8 h-full flex flex-col">
        <div className="h-12 w-12 bg-kifaa-50 rounded-xl flex items-center justify-center text-kifaa-800 mb-6">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground text-sm md:text-base">{description}</p>
      </div>
    </FadeIn>
  );
};

const Features: React.FC = () => {
  const features = [
    {
      title: "AI-Based Credit Scoring",
      description: "Get financing offers tailored to your financial behavior, not just traditional credit scores.",
      icon: <Brain className="h-6 w-6" />,
      delay: 0.2
    },
    {
      title: "Seamless Wallet Integration",
      description: "Fund your Kifaa wallet through M-Pesa, Airtel Money, bank transfers, or cryptocurrency.",
      icon: <Wallet className="h-6 w-6" />,
      delay: 0.3
    },
    {
      title: "Affordable Asset Financing",
      description: "Gain access to bank-backed financing options with reduced risk and better terms.",
      icon: <CreditCard className="h-6 w-6" />,
      delay: 0.4
    },
    {
      title: "Blockchain-Powered Payments",
      description: "Enjoy fast, low-cost transactions beyond borders with cutting-edge blockchain technology.",
      icon: <Layers className="h-6 w-6" />,
      delay: 0.5
    },
    {
      title: "USSD Accessibility for All",
      description: "Designed to serve both urban and underserved communities with an easy-to-use mobile USSD platform.",
      icon: <Smartphone className="h-6 w-6" />,
      delay: 0.6
    }
  ];

  return (
    <section id="features" className="section relative">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <h2 className="mb-4">Why Choose <span className="text-kifaa">Kifaa</span>?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with seamless financial tools to give you unprecedented access to affordable financing.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={feature.delay}
            />
          ))}
        </div>

        <FadeIn className="mt-16 text-center" delay={0.7}>
          <div className="glass-card p-8 md:p-10 max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">Who is Kifaa for?</h3>
            <ul className="text-left space-y-4 mb-6">
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-kifaa-50 text-kifaa flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">✓</span>
                <span>Individuals seeking affordable financing for vehicles, electronics, and business tools.</span>
              </li>
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-kifaa-50 text-kifaa flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">✓</span>
                <span>Small businesses & entrepreneurs looking for growth capital and streamlined transactions.</span>
              </li>
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-kifaa-50 text-kifaa flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">✓</span>
                <span>Enterprises requiring intelligent credit risk assessment for financial decision-making.</span>
              </li>
            </ul>
            <button className="btn-primary">Join Kifaa Today</button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Features;
