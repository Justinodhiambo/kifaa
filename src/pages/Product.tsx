
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Check, Shield, Smartphone, BanknoteIcon, LineChart, Zap, UserCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimatedGradient from '@/components/AnimatedGradient';
import FadeIn from '@/components/FadeIn';

const Product = () => {
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
                Kifaa Platform
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6">Next-Generation Fintech Platform</h1>
              <p className="text-lg text-muted-foreground">
                AI-powered credit scoring enabling affordable asset financing for underserved populations
              </p>
            </div>
          </div>
        </section>
        
        {/* Product Overview */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FadeIn>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Product Overview</h2>
                <div className="prose prose-lg max-w-none text-foreground">
                  <p>
                    Kifaa is a next-generation fintech platform that delivers AI-powered credit scoring, enabling affordable asset financing for underserved populations. Built to bridge the gap between informal economies and formal financial systems, Kifaa empowers users and financial institutions with accurate risk insights, digital wallets, and secure mobile-first experiences.
                  </p>
                  <p>
                    The platform supports consumers via mobile apps and USSD, and partners via an enterprise dashboard and API suite.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Platform Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools for financial inclusion and intelligent asset financing
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <FadeIn delay={0.1}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <LineChart className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>AI Credit Scoring Engine</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Analyzes mobile transactions, behavioral data, and alternative signals to generate accurate credit scores.
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={0.2}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Tiered Risk Segmentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Automatically categorizes users into creditworthiness tiers to guide partner lending decisions.
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={0.3}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <BanknoteIcon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Wallet & Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Integrates with M-Pesa, Airtel Money, cryptocurrency, and bank transfers for top-ups and repayments.
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={0.4}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Smartphone className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>USSD Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Allows users without smartphones or internet access to check scores, apply for financing, and transact securely.
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={0.5}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <LineChart className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Bank & Lender Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      A centralized platform for financial institutions to track borrowers, risk scores, and portfolio performance.
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={0.6}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Digital KYC & Onboarding</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Fast, secure registration and verification flows using mobile-based identity data.
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={0.7} className="md:col-span-2 lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Blockchain-Powered Remittances</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Enables fast, low-cost, cross-border payments for users and small businesses.
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
            
            <div className="mt-12 text-center">
              <Button className="rounded-full" size="lg" asChild>
                <a href="/register">Get Started <ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Product;
