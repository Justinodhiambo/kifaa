
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedGradient from '@/components/AnimatedGradient';
import FadeIn from '@/components/FadeIn';
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Link, CreditCard, Zap, Phone, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Integration = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-16 pb-12 md:pt-24 md:pb-16">
          <AnimatedGradient subtle={true} />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="inline-block py-1.5 px-4 rounded-full text-sm font-medium mb-6 bg-primary/10 text-primary border-primary/20 border">
                Integrations
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6">Seamless Connections</h1>
              <p className="text-lg text-muted-foreground">
                Kifaa integrates with the platforms and services you already use
              </p>
            </div>
          </div>
        </section>
        
        {/* Integration Categories */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <FadeIn>
                <div>
                  <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                    <Smartphone className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Mobile Money</h2>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 rounded-lg bg-card border">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4">
                        <img 
                          src="/lovable-uploads/16acf6aa-1204-4b7c-ac3a-ac96f897eca4.png" 
                          alt="M-Pesa" 
                          className="h-10 w-10 object-contain" 
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">M-Pesa</h3>
                        <p className="text-sm text-muted-foreground">Direct integration for payments and disbursements</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 rounded-lg bg-card border">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4">
                        <img 
                          src="/lovable-uploads/a629ea9e-91d3-4ffd-8877-0873a94269c5.png" 
                          alt="Airtel Money" 
                          className="h-10 w-10 object-contain" 
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">Airtel Money</h3>
                        <p className="text-sm text-muted-foreground">Complete payment integration for Airtel users</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 rounded-lg bg-card border">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100 mr-4">
                        <div className="font-bold text-blue-600">Eq</div>
                      </div>
                      <div>
                        <h3 className="font-medium">Equitel</h3>
                        <p className="text-sm text-muted-foreground">Money transfers and loan processing</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
              
              <FadeIn delay={0.2}>
                <div>
                  <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                    <Link className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Banking APIs</h2>
                  
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Integration Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                          <span>Loan disbursement directly to customer accounts</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                          <span>Real-time payment reconciliation with webhooks</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                          <span>Automated repayment tracking and notifications</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                          <span>Real-time account activity monitoring</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                          <span>KYC verification through banking partners</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <p className="text-sm text-muted-foreground">
                    Kifaa's banking API connects with all major Kenyan banks and financial institutions, providing a secure and compliant integration layer.
                  </p>
                </div>
              </FadeIn>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
              <FadeIn delay={0.3}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>CRMs & Core Lending Systems</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Plug-and-play compatibility via RESTful APIs for easy integration with your existing systems.
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={0.4}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Telecom & Device Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Enrich credit scoring accuracy with alternative data from telecom providers and device usage patterns.
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={0.5}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Crypto Wallets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Enable borderless transactions with supported cryptocurrency wallets for global remittances and payments.
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
            
            <div className="mt-16 text-center">
              <Button className="rounded-full" size="lg" asChild>
                <a href="/register">Become an Integration Partner <ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Integration;
