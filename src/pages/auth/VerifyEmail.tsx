
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from '@/hooks/use-auth';
import { MailCheck, RefreshCw, Check } from 'lucide-react';

const VerifyEmail = () => {
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const email = user?.email || localStorage.getItem('pendingVerificationEmail') || 'your email';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      // In a real implementation, this would call a method from your auth service
      // For now, we'll just simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Verification email resent successfully!');
      setCountdown(60); // Set a 60-second countdown
    } catch (error) {
      toast.error('Failed to resend verification email. Please try again.');
      console.error('Error resending verification email:', error);
    } finally {
      setIsResending(false);
    }
  };

  // This would be triggered by a callback URL or manual check
  const handleVerificationSuccess = () => {
    toast.success('Email verified successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <MailCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-md text-sm">
            <p className="mb-2">
              Please check your email and click the verification link to complete your registration.
            </p>
            <p>
              If you don't see the email, please check your spam folder or request a new verification link.
            </p>
          </div>
          
          {/* For demo purposes - normally this button would be hidden */}
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2" 
            onClick={handleVerificationSuccess}
          >
            <Check className="h-4 w-4" />
            Simulate Verification Success
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleResendVerification}
            disabled={isResending || countdown > 0}
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend available in ${countdown}s`
            ) : (
              'Resend Verification Email'
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center">
            Already verified?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            Need help?{" "}
            <a href="mailto:support@kifaa.io" className="text-primary hover:underline">
              Contact Support
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
