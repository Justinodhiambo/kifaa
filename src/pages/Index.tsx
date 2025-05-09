import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import LaptopFrame from '@/components/LaptopFrame';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard, BanknoteIcon, ArrowUpRight, ArrowDownLeft, Clock, User } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AnimatedGradient from '@/components/AnimatedGradient';
import FadeIn from '@/components/FadeIn';
import { cn } from '@/lib/utils';
import ImageGallery from '@/components/ImageGallery';

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
    <div className="min-h-screen flex flex-col bg-white text-foreground font-sf">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-28 relative overflow-hidden bg-white">
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
                  Get connected to financing for motorbikes, phones, and more — even with no credit history. 
                  Available via USSD, M-Pesa, Airtel, and crypto.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button 
                    className="w-full sm:w-auto text-base group rounded-full py-6" 
                    size="lg" 
                    onClick={() => {
                      const heroSection = document.querySelector('section');
                      if (heroSection) {
                        window.scrollTo({
                          top: 0,
                          behavior: 'smooth'
                        });
                      }
                    }}
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
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-green-100">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 190" className="h-6 w-6">
                        <path fill="#42B549" d="M94.6,0C42.3,0,0,42.4,0,94.6s42.4,94.6,94.6,94.6s94.6-42.4,94.6-94.6S146.9,0,94.6,0z M94.6,167.8c-40.4,0-73.1-32.7-73.1-73.1s32.7-73.1,73.1-73.1s73.1,32.7,73.1,73.1S135,167.8,94.6,167.8z"/>
                        <path fill="#42B549" d="M127.1,102.3l-4.8-3c-7.3-4.8-9.6-8.7-9.6-14.5v-2.1c2.1-2.1,4.1-5.3,5.3-8.9c2.7-0.4,4.8-2.7,4.8-5.5v-7.1c0-2-1.1-3.9-2.7-4.8v-10c0.1-0.9,0.5-6.8-3.7-11.7c-3.7-4.3-9.8-6.6-18.1-6.6c-8.3,0-14.4,2.3-18.1,6.6c-4.3,4.9-3.9,10.8-3.7,11.7v10c-1.6,1-2.7,2.8-2.7,4.8v7.1c0,2,1.1,3.9,2.7,4.8c1.4,5.3,4.4,9.2,5.3,9.8v2c0,5.4-2,9-9.7,14.2l-4.8,3.2c-7.8,5.4-12.6,10.5-12.6,22.5h85.5C139.8,112.7,134.9,107.6,127.1,102.3z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">M-Pesa</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-red-100">
                      {/* Updated Airtel Money logo */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-6 w-6">
                        <path fill="#E40613" d="M256 0C114.84 0 0 114.84 0 256s114.84 256 256 256 256-114.84 256-256S397.16 0 256 0zm0 475.43c-120.85 0-219.43-98.58-219.43-219.43S135.15 36.57 256 36.57 475.43 135.15 475.43 256 376.85 475.43 256 475.43z"/>
                        <path fill="#E40613" d="M350.48 187.66c-7.99-8.01-17.99-12.02-28.68-12.02h-.42c-5.25-7.98-14.01-13.17-23.82-13.17h-30.86c-10.77-18.12-30.15-30.21-51.54-30.21h-81.08C101.99 132.26 75 159.25 75 192.33v93.34c0 33.08 26.99 60.07 60.07 60.07h81.08c14.68 0 28.1-5.14 38.69-13.7 10.66 8.14 23.96 13.01 38.47 13.01h30.86c7.64 0 14.61-2.26 20.54-6.12 6.17 3.75 13.42 5.93 21.19 5.93 22.57 0 40.9-18.33 40.9-40.9v-82.3c0-12.81-5.31-24.83-14.32-33.91zM216.16 321.37h-81.08c-19.71 0-35.7-16-35.7-35.7v-93.34c0-19.71 15.99-35.7 35.7-35.7h81.08c19.71 0 35.7 15.99 35.7 35.7v93.34c0 19.7-15.99 35.7-35.7 35.7zm92.98 0h-30.86c-10.8 0-19.57-8.77-19.57-19.57v-18.78h70.01v18.78c0 10.8-8.78 19.57-19.58 19.57zm51.49-25.37c0 9.2-7.45 16.65-16.65 16.65-3.18 0-6.14-0.91-8.67-2.45v-35.59c0-7.36-5.96-13.32-13.32-13.32h-62.79v-44.13c0-10.8 8.77-19.57 19.57-19.57h30.86c10.8 0 19.58 8.77 19.58 19.57v26.46c0 7.36 5.96 13.32 13.32 13.32h18.1c9.2 0 16.65 7.45 16.65 16.65v22.73z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Airtel Money</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100">
                      <BanknoteIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium">Trusted by Local Banks</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="#F7931A">
                        <path d="M23.638 14.904c-1.602 6.425-8.113 10.342-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.495.615.78l-1.477 5.92c-.075.18-.24.45-.614.35.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.54 2.14 1.32.33.54-2.18c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.52 2.75 2.084v.006z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Crypto-Friendly</span>
                  </div>
                </div>
              </FadeIn>
              
              <FadeIn delay={0.3} duration={0.6} direction="left" className="relative">
                <div className="relative mx-auto max-w-md">
                  <ImageGallery 
                    category="mpesa" 
                    index={0}
                    rounded="rounded-2xl" 
                    maxHeight="500px"
                    className="shadow-apple" 
                  />
                  <div className="absolute top-5 right-5 bg-green-500 text-white font-bold py-2 px-4 rounded-full">
                    CONNECTED
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
        <section className="py-16 bg-gray-50" id="dashboard-demo">
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
                <div className="h-10 flex items-center px-3 border-b bg-gray-100 border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto text-xs px-4 py-1 rounded-full bg-gray-200 text-gray-800">
                    kifaa.io/dashboard
                  </div>
                </div>
                
                {/* Dashboard content */}
                <div className="p-6 overflow-auto bg-white" style={{ maxHeight: 'calc(100% - 2.5rem)' }}>
                  <header className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-2xl font-bold">Kifaa Dashboard</h1>
                      <p className="text-muted-foreground">Welcome back, Wanjiku Kamau</p>
                    </div>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>WK</AvatarFallback>
                      </Avatar>
                    </div>
                  </header>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="border-2 shadow-md">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">KES 45,231.89</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Available for transactions
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 shadow-md">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                        <CreditCard className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Current connected loans
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 shadow-md">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
                        <BanknoteIcon className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">725</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Good
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="mb-6 border-2 shadow-md">
                    <CardHeader>
                      <CardTitle>Recent Transactions</CardTitle>
                      <CardDescription>Your latest financial activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="rounded-full p-2 bg-gray-100">
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
                      className="p-3 text-center rounded-md bg-primary hover:bg-primary/90 text-white"
                    >
                      Fund Wallet
                    </Button>
                    <Button 
                      onClick={() => handleNavigate('/loans')}
                      className="p-3 text-center rounded-md bg-primary hover:bg-primary/90 text-white"
                    >
                      Apply for Loan
                    </Button>
                    <Button 
                      onClick={() => handleNavigate('/products')}
                      className="p-3 text-center rounded-md bg-primary hover:bg-primary/90 text-white"
                    >
                      Browse Products
                    </Button>
                    <Button 
                      onClick={() => handleNavigate('/refer')}
                      className="p-3 text-center rounded-md bg-primary hover:bg-primary/90 text-white"
                    >
                      Refer a Friend
                    </Button>
                  </div>
                </div>
              </div>
            </LaptopFrame>
          </div>
        </section>
        
        {/* Testimonial Section without images */}
        <section className="py-16 md:py-24 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Hear from Our Users</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real stories from business owners and individuals who have transformed their financial journey with Kifaa.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white rounded-xl shadow-sm border p-6 transition hover:shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <span className="font-semibold text-xl text-primary">JM</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">James Mwangi</h4>
                    <p className="text-sm text-gray-500">Small Business Owner, Nairobi</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "I was able to get financing for my motorcycle without any traditional credit history. Now I'm able to make deliveries for my business and my income has doubled."
                </p>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white rounded-xl shadow-sm border p-6 transition hover:shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <span className="font-semibold text-xl text-primary">FW</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Faith Wambui</h4>
                    <p className="text-sm text-gray-500">Entrepreneur, Nakuru</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "The process was seamless! I applied for a loan to buy inventory for my shop and got approved within hours. The reasonable interest rates made all the difference."
                </p>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-white rounded-xl shadow-sm border p-6 transition hover:shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <span className="font-semibold text-xl text-primary">PO</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Peter Odhiambo</h4>
                    <p className="text-sm text-gray-500">Teacher, Mombasa</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "I was skeptical at first, but Kifaa made financing my new smartphone so simple. Their credit score system actually worked in my favor unlike traditional banks."
                </p>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4].map((star) => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Add Features, HowItWorks, and Testimonials components */}
        <Features />
        <HowItWorks />
        <Testimonials />
        
        <Footer />
      </main>
    </div>
  );
};

export default Index;
