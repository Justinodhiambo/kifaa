
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import LaptopFrame from '@/components/LaptopFrame';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [laptopVariant, setLaptopVariant] = useState<'macbook' | 'windows'>('macbook');
  
  const toggleLaptopVariant = () => {
    setLaptopVariant(prev => prev === 'macbook' ? 'windows' : 'macbook');
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
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen flex flex-col bg-background text-foreground font-sf dark:bg-gray-950">
        <Navbar />
        <main className="flex-1">
          <Hero />
          
          {/* Demo laptop frame section */}
          <section className="py-12 bg-muted/50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Experience Our Platform</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Get a preview of our intuitive dashboard interface designed for simplicity and functionality.
                </p>
                <button 
                  onClick={toggleLaptopVariant} 
                  className="mt-4 px-4 py-2 rounded-md bg-primary text-white text-sm"
                >
                  Switch to {laptopVariant === 'macbook' ? 'Windows' : 'MacBook'} Style
                </button>
              </div>
              
              <LaptopFrame variant={laptopVariant}>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground">
                          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                        </svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground">
                          <rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line>
                        </svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground">
                          <rect width="20" height="12" x="2" y="6" rx="2"></rect><path d="M14 2v4"></path><path d="M10 2v4"></path><path d="M22 13c0 4.2-2.8 7-7 7s-7-2.8-7-7 2.8-7 7-7 7 2.8 7 7Z"></path><path d="M19.5 13.5 15 18l-2.5-2.5"></path>
                        </svg>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">725</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Good
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="text-center py-4">
                    <a href="/login" className="px-6 py-2 bg-primary text-white rounded-md inline-block hover:bg-primary/90 transition-colors">
                      Sign in to access your dashboard
                    </a>
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
