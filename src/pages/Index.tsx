
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import LaptopFrame from '@/components/LaptopFrame';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard, BanknoteIcon, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AnimatedGradient from '@/components/AnimatedGradient';
import FadeIn from '@/components/FadeIn';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';

const Index = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Sample transactions for demo
  const recentTransactions = [
    { 
      id: 1, 
      description: "Smartphone purchase", 
      amount: 12500, 
      currency: "KES", 
      type: "withdrawal", 
      created_at: new Date().toISOString() 
    },
    { 
      id: 2, 
      description: "Wallet deposit", 
      amount: 5000, 
      currency: "KES", 
      type: "deposit", 
      created_at: new Date(Date.now() - 86400000).toISOString() 
    },
    { 
      id: 3, 
      description: "Loan payment", 
      amount: 3000, 
      currency: "KES", 
      type: "withdrawal", 
      created_at: new Date(Date.now() - 172800000).toISOString() 
    }
  ];

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Navigation handlers
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  useEffect(() => {
    // Handle animations with intersection observer
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-animation');
    revealElements.forEach((element) => {
      observer.observe(element);
    });

    // Handle hash links on page load
    const handleHashLinkOnLoad = () => {
      const { hash } = window.location;
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash.slice(1));
          if (element) {
            const headerHeight = 80; // Approximate navbar height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100); // Small delay to ensure elements are rendered
      }
    };
    
    handleHashLinkOnLoad();

    // Apply smooth scrolling to the entire page
    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      revealElements.forEach((element) => {
        observer.unobserve(element);
      });
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen flex flex-col bg-background text-foreground font-sf">
        <Navbar />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-16 md:py-28 relative overflow-hidden">
            <AnimatedGradient subtle={true} />
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <FadeIn delay={0.1} duration={0.6} className="text-center lg:text-left">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
                    Affordable Loans. <br className="hidden md:inline" />
                    Instant Credit Scores. <br className="hidden md:inline" />
                    <span className="text-gradient-primary">All from Your Phone.</span>
                  </h1>
                  
                  <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto lg:mx-0 text-muted-foreground">
                    Get financing for motorbikes, phones, and more — even with no credit history. 
                    Available via USSD, M-Pesa, Airtel, and crypto.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                    <Button 
                      className="w-full sm:w-auto text-base group rounded-full py-6" 
                      size="lg" 
                      onClick={() => handleNavigate('/credit-score')}
                    >
                      Check Your Score
                      <ArrowUpRight className="ml-2 h-4 w-4 inline group-hover:translate-x-1 transition-transform" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto text-base rounded-full py-6" 
                      size="lg"
                      onClick={() => {
                        const element = document.getElementById('how-it-works');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      How It Works
                    </Button>
                  </div>
                  
                  <div className="mt-10 flex flex-wrap justify-center lg:justify-start items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        isDark ? "bg-gray-800" : "bg-gray-100"
                      )}>
                        <img 
                          src="https://cdn-icons-png.flaticon.com/512/825/825464.png" 
                          alt="M-Pesa" 
                          className="h-5 w-5"
                        />
                      </div>
                      <span className="text-sm font-medium">M-Pesa</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        isDark ? "bg-gray-800" : "bg-gray-100"
                      )}>
                        <img 
                          src="https://cdn-icons-png.flaticon.com/512/5968/5968200.png" 
                          alt="Airtel Money" 
                          className="h-5 w-5"
                        />
                      </div>
                      <span className="text-sm font-medium">Airtel Money</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        isDark ? "bg-gray-800" : "bg-gray-100"
                      )}>
                        <BanknoteIcon className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="text-sm font-medium">Trusted by Local Banks</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        isDark ? "bg-gray-800" : "bg-gray-100"
                      )}>
                        <img 
                          src="https://cdn-icons-png.flaticon.com/512/5968/5968260.png" 
                          alt="Crypto-Friendly" 
                          className="h-5 w-5"
                        />
                      </div>
                      <span className="text-sm font-medium">Crypto-Friendly</span>
                    </div>
                  </div>
                </FadeIn>
                
                <FadeIn delay={0.3} duration={0.6} direction="left" className="relative">
                  <div className="relative mx-auto max-w-md">
                    <img 
                      src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format" 
                      alt="Kenyan person using Kifaa on a mobile phone" 
                      className="rounded-2xl shadow-apple object-cover h-[500px] w-full"
                    />
                    <div className="absolute top-5 right-5 bg-green-500 text-white font-bold py-2 px-4 rounded-full">
                      APPROVED
                    </div>
                    
                    {/* Add a decorative element */}
                    <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-2xl rotate-12 bg-primary-500/20 backdrop-blur-sm z-[-1]"></div>
                    <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-blue-500/20 backdrop-blur-sm z-[-1]"></div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </section>
          
          {/* Demo browser dashboard section */}
          <section className="py-16 bg-muted/30" id="dashboard-demo">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Experience Our Platform</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Get a preview of our intuitive dashboard interface designed for simplicity and functionality.
                </p>
              </div>
              
              <LaptopFrame>
                <div className="h-full">
                  {/* Browser-style UI */}
                  <div className="h-10 flex items-center px-3 border-b bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mx-auto text-xs px-4 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      kifaa.io/dashboard
                    </div>
                  </div>
                  
                  {/* Dashboard content */}
                  <div className="p-6 overflow-auto" style={{ maxHeight: 'calc(100% - 2.5rem)' }}>
                    <header className="flex justify-between items-center mb-6">
                      <div>
                        <h1 className="text-2xl font-bold">Kifaa Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, Wanjiku Kamau</p>
                      </div>
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=100&auto=format" 
                            alt="Wanjiku Kamau"
                          />
                          <AvatarFallback>WK</AvatarFallback>
                        </Avatar>
                      </div>
                    </header>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                          <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">KES 45,231.89</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Available for withdrawal
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">2</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Current loans
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
                          <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">725</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Good
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Your latest financial activity</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentTransactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="rounded-full p-2 bg-gray-100 dark:bg-gray-800">
                                  {getTransactionIcon(transaction.type)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{transaction.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(transaction.created_at).toLocaleDateString('en-US', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className={`text-sm font-medium ${transaction.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                                {transaction.type === 'deposit' ? '+' : '-'}
                                {formatCurrency(transaction.amount, transaction.currency)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button 
                        onClick={() => handleNavigate('/wallet')}
                        variant="dashboard"
                        className="p-3 text-center rounded-md"
                      >
                        Fund Wallet
                      </Button>
                      <Button 
                        onClick={() => handleNavigate('/loans')}
                        variant="dashboard"
                        className="p-3 text-center rounded-md"
                      >
                        Apply for Loan
                      </Button>
                      <Button 
                        onClick={() => handleNavigate('/products')}
                        variant="dashboard"
                        className="p-3 text-center rounded-md"
                      >
                        Browse Products
                      </Button>
                      <Button 
                        onClick={() => handleNavigate('/refer')}
                        variant="dashboard"
                        className="p-3 text-center rounded-md"
                      >
                        Refer a Friend
                      </Button>
                    </div>
                  </div>
                </div>
              </LaptopFrame>
            </div>
          </section>
          
          <HowItWorks />
          <Features />
          <Testimonials />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Index;
