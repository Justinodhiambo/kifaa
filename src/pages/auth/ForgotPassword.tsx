
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { MailIcon, RefreshCw, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const { forgotPassword } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
    }
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      setIsSubmitting(true);
      setEmail(data.email);
      await forgotPassword(data.email);
      setIsSuccess(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.');
      console.error('Error sending reset link:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <MailIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent a password reset link to <span className="font-medium">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md text-sm">
              <p className="mb-2">
                Click the link in your email to reset your password. The link will expire after 24 hours.
              </p>
              <p>
                If you don't see the email, please check your spam folder or try another email address.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2" 
              onClick={() => setIsSuccess(false)}
            >
              <ArrowLeft className="h-4 w-4" />
              Try another email
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm">
              Remember your password?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-primary/10 p-3">
              <MailIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">Enter your email to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
