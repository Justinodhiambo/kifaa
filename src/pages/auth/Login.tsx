
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Hexagon, Zap, Mail, Lock, LogIn, ArrowRight } from "lucide-react";
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import AnimatedGradient from '@/components/AnimatedGradient';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const isDark = theme === "dark";
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back!', {
        description: 'You have successfully signed in to your account.',
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Sign in failed', {
        description: 'Please check your credentials and try again.',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <AnimatedGradient subtle={true} />
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
          {/* Left side - Login form */}
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
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center lg:text-left">Welcome back</h1>
              <p className="text-muted-foreground text-center lg:text-left">Sign in to access your account and manage your finances</p>
            </div>
            
            <Card className="border border-border shadow-lg bg-card backdrop-blur-sm animate-fade-in">
              <CardHeader className="bg-card">
                <CardTitle className="text-2xl text-foreground">Sign In</CardTitle>
                <CardDescription className="text-muted-foreground">Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Email</FormLabel>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                placeholder="you@example.com" 
                                className="pl-10 bg-background text-foreground border-2 focus:border-primary" 
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
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Password</FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                placeholder="••••••••" 
                                className="pl-10 bg-background text-foreground border-2 focus:border-primary" 
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
                        Sign In
                        <LogIn className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 bg-card">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline underline-offset-4 transition-colors"
                >
                  Forgot password?
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Don't have an account?
                  </span>
                  <Link 
                    to="/register" 
                    className="text-sm font-medium text-primary hover:underline underline-offset-4 flex items-center gap-1 group"
                  >
                    Create account
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          {/* Right side - Image and messages */}
          <div className="hidden lg:flex w-full max-w-2xl flex-col items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1604313525622-c2f6b4729a0c?q=80&w=1200&auto=format" 
                alt="Kenyan entrepreneur using mobile financial services" 
                className="object-cover w-full h-[500px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
                <div className="bg-primary/10 backdrop-blur-lg rounded-xl p-6 border border-white/30 shadow-lg max-w-md text-white">
                  <h3 className="text-xl font-bold mb-2">Connect to financial services</h3>
                  <p className="text-white">Access our network of financing partners for better terms and opportunities.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 w-full">
              <div className={cn(
                "rounded-lg p-6 shadow-md border-2 bg-primary/5",
                isDark ? "bg-gray-800 text-white border-gray-700" : "bg-white border-primary/20"
              )}>
                <h4 className="font-bold mb-2 text-lg">Fast Processing</h4>
                <p className="text-sm">Connect to financial services through M-Pesa or Airtel Money</p>
              </div>
              <div className={cn(
                "rounded-lg p-6 shadow-md border-2 bg-primary/5",
                isDark ? "bg-gray-800 text-white border-gray-700" : "bg-white border-primary/20"
              )}>
                <h4 className="font-bold mb-2 text-lg">24/7 Support</h4>
                <p className="text-sm">Access customer service anytime via USSD or app</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
