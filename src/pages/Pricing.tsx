
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedGradient from '@/components/AnimatedGradient';
import FadeIn from '@/components/FadeIn';
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const PricingCard = ({
  title,
  price,
  description,
  features,
  isPopular = false,
  buttonText = "Get Started",
  buttonVariant = "default"
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText?: string;
  buttonVariant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | "dashboard";
}) => {
  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : 'border-border'}`}>
      {isPopular && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          <span className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Custom" && <span className="text-muted-foreground"> /month</span>}
        </div>
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={buttonVariant} asChild>
          <a href="/register">{buttonText} <ArrowRight className="ml-1.5 h-4 w-4" /></a>
        </Button>
      </CardFooter>
    </Card>
  );
};

const Pricing = () => {
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
                Pricing
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
              <p className="text-lg text-muted-foreground">
                Choose the plan that's right for your organization
              </p>
            </div>
          </div>
        </section>
        
        {/* Pricing Plans */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <FadeIn delay={0.1}>
                <PricingCard
                  title="Starter"
                  price="Free"
                  description="For NGOs & Pilots"
                  features={[
                    "Up to 100 users",
                    "Basic credit scoring",
                    "Mobile money integration",
                    "USSD access for users",
                    "Email support"
                  ]}
                  buttonText="Start Free"
                  buttonVariant="outline"
                />
              </FadeIn>
              
              <FadeIn delay={0.2}>
                <PricingCard
                  title="Growth"
                  price="$99"
                  description="For growing organizations"
                  features={[
                    "Up to 1,000 users",
                    "Dashboard access",
                    "Full API suite",
                    "Advanced credit scoring",
                    "Priority email support",
                    "Custom integrations"
                  ]}
                  isPopular={true}
                />
              </FadeIn>
              
              <FadeIn delay={0.3}>
                <PricingCard
                  title="Enterprise"
                  price="Custom"
                  description="For large organizations"
                  features={[
                    "Unlimited users",
                    "Advanced integrations",
                    "Priority support",
                    "Custom risk models",
                    "Dedicated account manager",
                    "Service level agreements",
                    "On-premise deployment option"
                  ]}
                  buttonText="Contact Sales"
                />
              </FadeIn>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
