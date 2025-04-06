
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Hexagon, Zap, Mail, Lock, User, Phone, UserPlus, ArrowLeft } from "lucide-react";
import { useTheme } from '@/components/ThemeProvider';
import AnimatedGradient from '@/components/AnimatedGradient';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { signUp } = useAuth();
  const isDark = theme === "dark";
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await signUp(data.email, data.password, {
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
      });
      
      toast.success('Account created!', {
        description: 'Please check your email to verify your account.',
      });
      
      navigate('/verify-email');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed', {
        description: 'There was an error creating your account. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <AnimatedGradient subtle={true} />
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
          {/* Left side - Registration form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="mb-8 flex flex-col items-center lg:items-start">
              <Link to="/" className="flex items-center mb-6 group">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center mr-3 shadow-md relative overflow-hidden">
                  <div className="relative z-10 flex items-center justify-center">
                    <Hexagon className="h-6 w-6 text-white" strokeWidth={1.5} />
                    <Zap className="h-4 w-4 text-white absolute" strokeWidth={2.5} />
                  </div>
                </div>
                <span className={cn(
                  "text-2xl font-display font-bold group-hover:text-primary transition-colors",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  Kifaa
                </span>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center lg:text-left">Create an account</h1>
              <p className="text-muted-foreground text-center lg:text-left">Join thousands of Kenyans accessing affordable financial services</p>
            </div>
            
            <Card className="border border-border/40 shadow-lg bg-card/60 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <CardDescription>Fill in your details to create an account</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <FormControl>
                                <Input 
                                  placeholder="John" 
                                  className="pl-10" 
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Doe" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                placeholder="you@example.com" 
                                className="pl-10" 
                                type="email"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                placeholder="+254 7XX XXX XXX" 
                                className="pl-10" 
                                type="tel"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormDescription>
                            We'll use this for loan disbursements via M-Pesa or Airtel Money
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                placeholder="••••••••" 
                                className="pl-10" 
                                type="password"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                placeholder="••••••••" 
                                className="pl-10" 
                                type="password"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full group relative overflow-hidden rounded-full py-6 mt-4"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Create Account
                        <UserPlus className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <div className="flex items-center gap-2">
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-primary hover:underline underline-offset-4 flex items-center gap-1 group"
                  >
                    <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                    Already have an account? Sign in
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          {/* Right side - Image and messages */}
          <div className="hidden lg:flex w-full max-w-2xl flex-col items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1200&auto=format" 
                alt="Local Kenyan team using financial services" 
                className="object-cover w-full h-[600px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg max-w-md text-white">
                  <h3 className="text-xl font-bold mb-2">Join our financial community</h3>
                  <p className="text-white/90">Get access to loans, build credit history, and improve your financial future.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className={cn(
                "rounded-lg p-4 shadow-md",
                isDark ? "bg-gray-800 text-white" : "bg-white border border-gray-200"
              )}>
                <h4 className="font-semibold mb-1 text-foreground">No Credit History</h4>
                <p className="text-sm text-muted-foreground">We approve loans even for first-time borrowers</p>
              </div>
              <div className={cn(
                "rounded-lg p-4 shadow-md",
                isDark ? "bg-gray-800 text-white" : "bg-white border border-gray-200"
              )}>
                <h4 className="font-semibold mb-1 text-foreground">Mobile First</h4>
                <p className="text-sm text-muted-foreground">Manage everything from your phone</p>
              </div>
              <div className={cn(
                "rounded-lg p-4 shadow-md",
                isDark ? "bg-gray-800 text-white" : "bg-white border border-gray-200"
              )}>
                <h4 className="font-semibold mb-1 text-foreground">Low Interest</h4>
                <p className="text-sm text-muted-foreground">Get the best rates in the market</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
