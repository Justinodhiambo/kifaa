
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedGradient from '@/components/AnimatedGradient';
import FadeIn from '@/components/FadeIn';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const Contact = () => {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    }
  });

  const onSubmit = (data) => {
    console.log('Form submitted:', data);
    toast.success('Message sent', {
      description: "We'll get back to you as soon as possible.",
    });
    form.reset();
  };

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
                  <Mail className="mr-1.5 h-4 w-4" /> 
                  Get in Touch
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6">Contact Us</h1>
              <p className="text-lg text-muted-foreground">
                Have questions or need assistance? We're here to help.
              </p>
            </div>
          </div>
        </section>
        
        {/* Contact Information */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              <FadeIn>
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Email</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      <a href="mailto:info@kifaa.io" className="text-primary hover:underline">info@kifaa.io</a>
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-2">
                      For general inquiries
                    </p>
                    <CardDescription className="mt-4">
                      <a href="mailto:support@kifaa.io" className="text-primary hover:underline">support@kifaa.io</a>
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-2">
                      For technical support
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={0.1}>
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Phone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      <a href="tel:+254700000000" className="text-primary hover:underline">+254 700 000000</a>
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-2">
                      Monday to Friday, 9am - 5pm EAT
                    </p>
                    <CardDescription className="mt-4">
                      <a href="tel:+254700000001" className="text-primary hover:underline">+254 700 000001</a>
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-2">
                      For urgent support
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={0.2}>
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Office</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground font-medium">
                      Kifaa Headquarters
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Westlands Business Park<br />
                      Nairobi, Kenya
                    </p>
                    <p className="text-sm text-primary mt-4">
                      By appointment only
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </section>
        
        {/* Contact Form */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <FadeIn>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name</label>
                          <Input 
                            placeholder="Your name" 
                            {...form.register('name', { required: true })} 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <Input 
                            type="email" 
                            placeholder="your.email@example.com" 
                            {...form.register('email', { required: true })} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <Input 
                          placeholder="What is your message about?" 
                          {...form.register('subject', { required: true })} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <Textarea 
                          placeholder="Your message..." 
                          rows={5} 
                          {...form.register('message', { required: true })} 
                        />
                      </div>
                    
                      <Button type="submit" className="w-full">
                        Send Message <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
