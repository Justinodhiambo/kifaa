
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedGradient from '@/components/AnimatedGradient';
import FadeIn from '@/components/FadeIn';
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, Users, Shield } from 'lucide-react';

const About = () => {
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
                About Kifaa
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6">Our Mission</h1>
              <p className="text-lg text-muted-foreground">
                Building tools that make credit fair and financing equitable for everyone
              </p>
            </div>
          </div>
        </section>
        
        {/* About Us */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FadeIn>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">About Us</h2>
                <div className="prose prose-lg max-w-none text-foreground">
                  <p>
                    Founded in Nairobi, Kifaa exists to bring the power of modern fintech to underserved regions. Our mission is to create tools that make credit fair and financing equitable. We're technologists, economists, and community builders united by a single vision: finance that works for everyone.
                  </p>
                  <p>
                    Kifaa is an African-founded fintech company focused on making credit accessible, affordable, and intelligent. We use alternative data and AI to break down barriers to financial inclusion, working with partners across finance, telecom, and government to drive sustainable growth and opportunity.
                  </p>
                </div>
              </FadeIn>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <FadeIn delay={0.1}>
                  <div className="text-center p-6 rounded-lg border bg-card shadow-sm">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">Who We Are</h3>
                    <p className="text-muted-foreground">
                      Technologists, economists, and community builders united by a vision of financial equality.
                    </p>
                  </div>
                </FadeIn>
                
                <FadeIn delay={0.2}>
                  <div className="text-center p-6 rounded-lg border bg-card shadow-sm">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">Our Roots</h3>
                    <p className="text-muted-foreground">
                      Founded in Nairobi with a focus on bringing fintech solutions to underserved regions.
                    </p>
                  </div>
                </FadeIn>
                
                <FadeIn delay={0.3}>
                  <div className="text-center p-6 rounded-lg border bg-card shadow-sm">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">Our Values</h3>
                    <p className="text-muted-foreground">
                      Integrity, innovation, and inclusion guide every decision we make.
                    </p>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>
        
        {/* Careers Section */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FadeIn>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Careers</h2>
                <div className="prose prose-lg max-w-none text-foreground mb-8">
                  <p>
                    We're not hiring right now. Check back with us at a later time for future opportunities to join the Kifaa team.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
        
        {/* Blog & Press Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
              <FadeIn>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Blog</h2>
                <div className="prose prose-lg max-w-none text-foreground mb-8">
                  <p>
                    Our blog is coming soon. Check back with us at a later time to explore stories, insights, and news from the Kifaa team.
                  </p>
                </div>
              </FadeIn>
              
              <FadeIn delay={0.2}>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Press</h2>
                <div className="prose prose-lg max-w-none text-foreground mb-8">
                  <p>
                    This page is currently under development. Check back with us at a later time for the latest press coverage and media mentions about Kifaa.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
