
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedGradient from '@/components/AnimatedGradient';
import FadeIn from '@/components/FadeIn';
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Link, CreditCard, Zap, Phone } from 'lucide-react';
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
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-green-100 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 190" className="h-7 w-7">
                          <path fill="#42B549" d="M94.6,0C42.3,0,0,42.4,0,94.6s42.4,94.6,94.6,94.6s94.6-42.4,94.6-94.6S146.9,0,94.6,0z M94.6,167.8c-40.4,0-73.1-32.7-73.1-73.1s32.7-73.1,73.1-73.1s73.1,32.7,73.1,73.1S135,167.8,94.6,167.8z"/>
                          <path fill="#42B549" d="M127.1,102.3l-4.8-3c-7.3-4.8-9.6-8.7-9.6-14.5v-2.1c2.1-2.1,4.1-5.3,5.3-8.9c2.7-0.4,4.8-2.7,4.8-5.5v-7.1c0-2-1.1-3.9-2.7-4.8v-10c0.1-0.9,0.5-6.8-3.7-11.7c-3.7-4.3-9.8-6.6-18.1-6.6c-8.3,0-14.4,2.3-18.1,6.6c-4.3,4.9-3.9,10.8-3.7,11.7v10c-1.6,1-2.7,2.8-2.7,4.8v7.1c0,2,1.1,3.9,2.7,4.8c1.4,5.3,4.4,9.2,5.3,9.8v2c0,5.4-2,9-9.7,14.2l-4.8,3.2c-7.8,5.4-12.6,10.5-12.6,22.5h85.5C139.8,112.7,134.9,107.6,127.1,102.3z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">M-Pesa</h3>
                        <p className="text-sm text-muted-foreground">Direct integration for payments and disbursements</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 rounded-lg bg-card border">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-red-100 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" className="h-7 w-7">
                          <path fill="#E40613" d="M75,0C33.6,0,0,33.6,0,75s33.6,75,75,75s75-33.6,75-75S116.4,0,75,0z M75,130c-30.4,0-55-24.6-55-55s24.6-55,55-55s55,24.6,55,55S105.4,130,75,130z"/>
                          <path fill="#E40613" d="M87.5,50H62.5c-6.9,0-12.5,5.6-12.5,12.5v25c0,6.9,5.6,12.5,12.5,12.5h25c6.9,0,12.5-5.6,12.5-12.5v-25C100,55.6,94.4,50,87.5,50z M75,90c-8.3,0-15-6.7-15-15s6.7-15,15-15s15,6.7,15,15S83.3,90,75,90z"/>
                        </svg>
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
                  <div className="prose text-foreground max-w-none">
                    <p>Our platform seamlessly integrates with banking systems for:</p>
                    <ul>
                      <li>Loan disbursement</li>
                      <li>Payment reconciliation</li>
                      <li>Automated repayment tracking</li>
                      <li>Real-time account activity</li>
                      <li>KYC verification</li>
                    </ul>
                    <p>
                      Kifaa's banking API connects with all major Kenyan banks and financial institutions, providing a secure and compliant integration layer.
                    </p>
                  </div>
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
