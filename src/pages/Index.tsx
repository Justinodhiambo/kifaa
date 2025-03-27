
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
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

const Index = () => {
  const navigate = useNavigate();
  
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
                            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" 
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
                        className="p-3 text-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        Fund Wallet
                      </Button>
                      <Button 
                        onClick={() => handleNavigate('/loans')}
                        className="p-3 text-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        Apply for Loan
                      </Button>
                      <Button 
                        onClick={() => handleNavigate('/products')}
                        className="p-3 text-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        Browse Products
                      </Button>
                      <Button 
                        onClick={() => handleNavigate('/refer')}
                        className="p-3 text-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        Refer a Friend
                      </Button>
                    </div>
                  </div>
                </div>
              </LaptopFrame>
            </div>
          </section>
          
          <Features />
          <HowItWorks />
          <Testimonials />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Index;
