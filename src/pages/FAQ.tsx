
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedGradient from '@/components/AnimatedGradient';
import FadeIn from '@/components/FadeIn';
import { Button } from "@/components/ui/button";
import { ArrowRight, HelpCircle, Phone, Mail } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Is Kifaa a lender?",
      answer: "No. Kifaa is not a lender. We provide infrastructure and AI credit scoring for banks and institutions to make informed lending decisions."
    },
    {
      question: "How do you assess my credit?",
      answer: "We use alternative data like mobile money history, phone usage patterns, and payment behaviors to generate credit scores."
    },
    {
      question: "Can I access Kifaa without internet?",
      answer: "Yes. Our USSD flow allows users to interact with Kifaa without data or smartphones."
    },
    {
      question: "Is my data safe?",
      answer: "Yes. Kifaa uses industry-standard encryption and complies with relevant data protection laws."
    },
    {
      question: "What currencies are supported?",
      answer: "Kenyan Shillings (KES), US Dollars (USD), and select cryptocurrencies."
    },
    {
      question: "How quickly can I get financing?",
      answer: "Most loan decisions are made in minutes, with funds disbursed within 1-24 hours, depending on the financial institution."
    },
    {
      question: "Do I need a bank account to use Kifaa?",
      answer: "No, you can receive funds and make payments using mobile money accounts like M-Pesa or Airtel Money."
    },
    {
      question: "What types of assets can I finance?",
      answer: "Partners offer financing for smartphones, tablets, laptops, motorcycles, small business equipment, and solar solutions."
    }
  ];

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
                <span className="flex items-center">
                  <HelpCircle className="mr-1.5 h-4 w-4" /> 
                  Support
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
              <p className="text-lg text-muted-foreground">
                Find answers to the most common questions about Kifaa
              </p>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-lg font-medium text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-card rounded-lg p-6 border text-center">
                <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg border bg-background flex flex-col items-center">
                    <Phone className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-medium mb-1">Call Support</h4>
                    <p className="text-sm text-muted-foreground">+254 700 000000</p>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-background flex flex-col items-center">
                    <Mail className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-medium mb-1">Email Us</h4>
                    <p className="text-sm text-muted-foreground">support@kifaa.io</p>
                  </div>
                </div>
                
                <Button className="rounded-full" asChild>
                  <a href="/contact">Contact Support Team <ArrowRight className="ml-2 h-4 w-4" /></a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;
