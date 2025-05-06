
import React from 'react';
import FadeIn from './FadeIn';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Wallet, 
  CreditCard, 
  Layers, 
  Smartphone,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
  iconBg?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon, 
  delay,
  iconBg = "bg-primary/10" 
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  return (
    <FadeIn delay={delay} className="fintech-card">
      <div className={cn(
        "p-6 md:p-8 h-full flex flex-col rounded-2xl border",
        isDark ? "bg-gray-800/80 backdrop-blur-sm border-gray-700" : "bg-white border-gray-100"
      )}>
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center text-primary mb-6",
          iconBg
        )}>
          {icon}
        </div>
        <h3 className={cn(
          "text-xl font-semibold mb-3",
          isDark ? "text-white" : "text-gray-900"
        )}>{title}</h3>
        <p className={cn(
          "text-sm md:text-base",
          isDark ? "text-gray-300" : "text-muted-foreground"
        )}>{description}</p>
      </div>
    </FadeIn>
  );
};

const Features: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  
  const features = [
    {
      title: "AI-Based Credit Scoring",
      description: "Our proprietary models assess risk based on spending habits and behavioral data—especially for those with limited credit history.",
      icon: <Brain className="h-6 w-6" />,
      delay: 0.2,
      iconBg: "bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400"
    },
    {
      title: "Seamless Wallet Integration",
      description: "Fund your Kifaa wallet through M-Pesa, Airtel Money, bank transfers, or cryptocurrency for easy transactions.",
      icon: <Wallet className="h-6 w-6" />,
      delay: 0.3,
      iconBg: "bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-400"
    },
    {
      title: "Connect to Financial Partners",
      description: "We connect you to bank-backed financing options with reduced risk and better terms through our partner network.",
      icon: <CreditCard className="h-6 w-6" />,
      delay: 0.4,
      iconBg: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400"
    },
    {
      title: "Blockchain-Powered Payments",
      description: "Enjoy fast, low-cost transactions beyond borders with cutting-edge blockchain technology.",
      icon: <Layers className="h-6 w-6" />,
      delay: 0.5,
      iconBg: "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400"
    },
    {
      title: "USSD Accessibility for All",
      description: "Designed to serve both urban and underserved communities with an easy-to-use mobile USSD platform.",
      icon: <Smartphone className="h-6 w-6" />,
      delay: 0.6,
      iconBg: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400"
    },
    {
      title: "Data Security & Privacy",
      description: "Bank-level encryption and security protocols protect your data and transactions at all times.",
      icon: <Shield className="h-6 w-6" />,
      delay: 0.7,
      iconBg: "bg-teal-500/10 text-teal-500 dark:bg-teal-500/20 dark:text-teal-400"
    }
  ];

  return (
    <section id="features" className={cn(
      "section relative",
      isDark ? "bg-gray-950" : "bg-gray-50/50"
    )}>
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 px-3 py-1.5 rounded-full">Features</Badge>
          <h2 className={cn(
            "mb-4 text-4xl md:text-5xl font-semibold",
            isDark ? "text-white" : "text-gray-900"
          )}>Why Choose <span className="text-gradient-primary">Kifaa</span>?</h2>
          <p className={cn(
            "text-lg max-w-2xl mx-auto",
            isDark ? "text-gray-300" : "text-muted-foreground"
          )}>
            Our platform connects AI-powered risk assessment with seamless financial tools to give you unprecedented access to affordable financing.
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
              iconBg={feature.iconBg}
            />
          ))}
        </div>

        <FadeIn className="mt-16" delay={0.7}>
          <div className={cn(
            "p-8 md:p-10 max-w-3xl mx-auto rounded-2xl border",
            isDark ? "bg-gray-800/80 backdrop-blur-sm border-gray-700" : "bg-white border-gray-100"
          )}>
            <h3 className={cn(
              "text-2xl font-semibold mb-4 text-center",
              isDark ? "text-white" : "text-gray-900"
            )}>Who is Kifaa for?</h3>
            <ul className="text-left space-y-4 mb-6">
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">✓</span>
                <span className={cn(
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>Individuals seeking affordable financing for vehicles, electronics, and business tools.</span>
              </li>
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">✓</span>
                <span className={cn(
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>Small businesses & entrepreneurs looking for growth capital and streamlined transactions.</span>
              </li>
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">✓</span>
                <span className={cn(
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>Enterprises requiring intelligent credit risk assessment for financial decision-making.</span>
              </li>
            </ul>
            <div className="flex justify-center">
              <Button 
                className="group rounded-full"
                onClick={() => navigate('/register')}
              >
                Join Kifaa Today
                <ArrowRight className="ml-2 h-4 w-4 inline group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Features;
