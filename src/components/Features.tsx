
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
  Shield,
  User,
  Users,
  Clock,
  GlobeLock,
  CheckSquare
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Switch } from "@/components/ui/switch";

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
  const { theme, setTheme, autoTheme, setAutoTheme } = useTheme();
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

  // Handle theme toggle manually (when auto is off)
  const handleToggleTheme = () => {
    if (!autoTheme) {
      setTheme(isDark ? "light" : "dark");
    }
  };

  // Handle auto theme toggle
  const handleToggleAutoTheme = (checked: boolean) => {
    setAutoTheme(checked);
  };

  return (
    <section id="features" className={cn(
      "section relative",
      isDark ? "bg-gray-950" : "bg-gray-50/50"
    )}>
      <div className="max-w-7xl mx-auto">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-8">
          <div className={cn(
            "flex items-center gap-2 py-2 px-4 rounded-full",
            isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
          )}>
            <span className={cn(
              "text-sm",
              isDark ? "text-gray-300" : "text-gray-700"
            )}>
              Auto Theme
            </span>
            <Switch 
              checked={autoTheme}
              onCheckedChange={handleToggleAutoTheme}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "ml-2 rounded-full h-8 w-8",
                !autoTheme ? "opacity-100" : "opacity-50 pointer-events-none"
              )}
              disabled={autoTheme}
              onClick={handleToggleTheme}
            >
              {isDark ? (
                <span className="text-yellow-400">☀️</span>
              ) : (
                <span className="text-blue-400">🌙</span>
              )}
            </Button>
          </div>
        </div>

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

        {/* New How It Works Section */}
        <div className="mt-24" id="how-it-works">
          <FadeIn className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 px-3 py-1.5 rounded-full">Process</Badge>
            <h2 className={cn(
              "mb-4 text-4xl md:text-5xl font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}>How <span className="text-gradient-primary">It Works</span></h2>
            <p className={cn(
              "text-lg max-w-3xl mx-auto",
              isDark ? "text-gray-300" : "text-muted-foreground"
            )}>
              Kifaa simplifies how consumers and businesses access financing, manage spending, and unlock new opportunities — all through one powerful platform.
            </p>
          </FadeIn>

          {/* Step 1 */}
          <div className={cn(
            "relative mb-20 p-8 rounded-2xl border",
            isDark ? "bg-gray-800/80 backdrop-blur-sm border-gray-700" : "bg-white border-gray-100"
          )}>
            <div className="absolute -top-6 left-8 h-12 w-12 rounded-full bg-primary text-white font-bold flex items-center justify-center text-lg">1</div>
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-center">
              <div>
                <div className={cn(
                  "h-20 w-20 rounded-xl flex items-center justify-center text-primary mb-6",
                  isDark ? "bg-gray-700" : "bg-blue-50"
                )}>
                  <User className="h-10 w-10" />
                </div>
              </div>
              <div>
                <h3 className={cn(
                  "text-2xl font-semibold mb-4",
                  isDark ? "text-white" : "text-gray-900"
                )}>Sign Up & Set Up</h3>
                <p className={cn(
                  "mb-6",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  Create your account in minutes. You'll provide basic details and choose whether you're signing up as a consumer or a business.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckSquare className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                      Individuals set up their profile and link their preferred wallet or payment methods.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckSquare className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                      Businesses create a merchant profile and connect inventory or services for financing options.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className={cn(
            "relative mb-20 p-8 rounded-2xl border",
            isDark ? "bg-gray-800/80 backdrop-blur-sm border-gray-700" : "bg-white border-gray-100"
          )}>
            <div className="absolute -top-6 left-8 h-12 w-12 rounded-full bg-primary text-white font-bold flex items-center justify-center text-lg">2</div>
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-center">
              <div>
                <div className={cn(
                  "h-20 w-20 rounded-xl flex items-center justify-center text-primary mb-6",
                  isDark ? "bg-gray-700" : "bg-blue-50"
                )}>
                  <Brain className="h-10 w-10" />
                </div>
              </div>
              <div>
                <h3 className={cn(
                  "text-2xl font-semibold mb-4",
                  isDark ? "text-white" : "text-gray-900"
                )}>AI-Powered Scoring</h3>
                <p className={cn(
                  "mb-4",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  Our AI-based credit scoring analyzes spending habits, payment history, and other data points to give you a Kifaa Score. This score determines your eligibility and tiers you into financing categories.
                </p>
                <p className={cn(
                  "font-medium",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  No invasive credit checks. No paperwork. Just smart data.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className={cn(
            "relative mb-20 p-8 rounded-2xl border",
            isDark ? "bg-gray-800/80 backdrop-blur-sm border-gray-700" : "bg-white border-gray-100"
          )}>
            <div className="absolute -top-6 left-8 h-12 w-12 rounded-full bg-primary text-white font-bold flex items-center justify-center text-lg">3</div>
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-center">
              <div>
                <div className={cn(
                  "h-20 w-20 rounded-xl flex items-center justify-center text-primary mb-6",
                  isDark ? "bg-gray-700" : "bg-blue-50"
                )}>
                  <Wallet className="h-10 w-10" />
                </div>
              </div>
              <div>
                <h3 className={cn(
                  "text-2xl font-semibold mb-4",
                  isDark ? "text-white" : "text-gray-900"
                )}>Financing & Wallet Access</h3>
                <p className={cn(
                  "mb-4",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  Based on your score:
                </p>
                <ul className="space-y-4 mb-4">
                  <li className={cn(
                    "p-4 rounded-lg",
                    isDark ? "bg-gray-700" : "bg-blue-50"
                  )}>
                    <p className={isDark ? "text-white" : "text-gray-800"}>
                      Consumers can unlock asset financing offers (phones, electronics, appliances, etc.).
                    </p>
                  </li>
                  <li className={cn(
                    "p-4 rounded-lg",
                    isDark ? "bg-gray-700" : "bg-blue-50"
                  )}>
                    <p className={isDark ? "text-white" : "text-gray-800"}>
                      Low-income users can use the USSD service to access micro-financing and affordable payment plans tailored to their income level.
                    </p>
                  </li>
                </ul>
                <p className={cn(
                  "font-medium",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  Funds and payments are managed through your Kifaa Wallet, which supports M-Pesa, Airtel Money, cryptocurrency, and bank transfers.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className={cn(
            "relative mb-20 p-8 rounded-2xl border",
            isDark ? "bg-gray-800/80 backdrop-blur-sm border-gray-700" : "bg-white border-gray-100"
          )}>
            <div className="absolute -top-6 left-8 h-12 w-12 rounded-full bg-primary text-white font-bold flex items-center justify-center text-lg">4</div>
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-center">
              <div>
                <div className={cn(
                  "h-20 w-20 rounded-xl flex items-center justify-center text-primary mb-6",
                  isDark ? "bg-gray-700" : "bg-blue-50"
                )}>
                  <CreditCard className="h-10 w-10" />
                </div>
              </div>
              <div>
                <h3 className={cn(
                  "text-2xl font-semibold mb-4",
                  isDark ? "text-white" : "text-gray-900"
                )}>Spend, Save, and Pay</h3>
                <p className={cn(
                  "mb-4",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  Use your Kifaa Wallet for:
                </p>
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-start">
                    <CheckSquare className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                      Paying for financed assets
                    </span>
                  </div>
                  <div className="flex items-start">
                    <CheckSquare className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                      Everyday purchases
                    </span>
                  </div>
                  <div className="flex items-start">
                    <CheckSquare className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                      Managing installments
                    </span>
                  </div>
                  <div className="flex items-start">
                    <CheckSquare className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                      Cross-border payments
                    </span>
                  </div>
                </div>
                <p className={cn(
                  "font-medium",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  Cross-border payments powered by blockchain for transparency and security.
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className={cn(
            "relative mb-20 p-8 rounded-2xl border",
            isDark ? "bg-gray-800/80 backdrop-blur-sm border-gray-700" : "bg-white border-gray-100"
          )}>
            <div className="absolute -top-6 left-8 h-12 w-12 rounded-full bg-primary text-white font-bold flex items-center justify-center text-lg">5</div>
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-center">
              <div>
                <div className={cn(
                  "h-20 w-20 rounded-xl flex items-center justify-center text-primary mb-6",
                  isDark ? "bg-gray-700" : "bg-blue-50"
                )}>
                  <Users className="h-10 w-10" />
                </div>
              </div>
              <div>
                <h3 className={cn(
                  "text-2xl font-semibold mb-4",
                  isDark ? "text-white" : "text-gray-900"
                )}>Business Tools (For Merchants)</h3>
                <p className={cn(
                  "mb-4",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  Businesses can offer Kifaa's financing options to their customers at checkout, increasing conversion and expanding their customer base.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckSquare className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                      Faster customer approvals
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckSquare className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                      Reduced risk through Kifaa's risk-scoring engine
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckSquare className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                      Monthly settlement of financed sales
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Key Features Summary */}
          <div className="mt-16 mb-8">
            <h3 className={cn(
              "text-2xl font-semibold mb-8 text-center",
              isDark ? "text-white" : "text-gray-900"
            )}>Quick Summary of Key Features</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className={cn(
                "p-4 rounded-xl text-center flex flex-col items-center",
                isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
              )}>
                <Brain className="h-8 w-8 text-primary mb-3" />
                <h4 className={cn(
                  "font-medium text-sm",
                  isDark ? "text-white" : "text-gray-900"
                )}>AI-Based Credit Scoring</h4>
              </div>
              
              <div className={cn(
                "p-4 rounded-xl text-center flex flex-col items-center",
                isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
              )}>
                <Smartphone className="h-8 w-8 text-primary mb-3" />
                <h4 className={cn(
                  "font-medium text-sm",
                  isDark ? "text-white" : "text-gray-900"
                )}>USSD Access for Low-Income Users</h4>
              </div>
              
              <div className={cn(
                "p-4 rounded-xl text-center flex flex-col items-center",
                isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
              )}>
                <Wallet className="h-8 w-8 text-primary mb-3" />
                <h4 className={cn(
                  "font-medium text-sm",
                  isDark ? "text-white" : "text-gray-900"
                )}>Kifaa Wallet (M-Pesa, Airtel, Crypto, Bank)</h4>
              </div>
              
              <div className={cn(
                "p-4 rounded-xl text-center flex flex-col items-center",
                isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
              )}>
                <Layers className="h-8 w-8 text-primary mb-3" />
                <h4 className={cn(
                  "font-medium text-sm",
                  isDark ? "text-white" : "text-gray-900"
                )}>Cross-Border Blockchain Payments</h4>
              </div>
              
              <div className={cn(
                "p-4 rounded-xl text-center flex flex-col items-center",
                isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
              )}>
                <Users className="h-8 w-8 text-primary mb-3" />
                <h4 className={cn(
                  "font-medium text-sm",
                  isDark ? "text-white" : "text-gray-900"
                )}>Merchant Financing Integration</h4>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-12">
            <Button 
              onClick={() => navigate('/register')} 
              className="group rounded-full px-8 py-6 text-lg"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5 inline group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
