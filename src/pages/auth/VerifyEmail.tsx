
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from '@/hooks/use-auth';
import { MailCheck, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
  const [isResending, setIsResending] = useState(false);
  const { user } = useAuth();
  const email = user?.email || localStorage.getItem('pendingVerificationEmail') || 'your email';

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      // In a real implementation, this would call a method from your auth service
      // For now, we'll just simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Verification email resent successfully!');
    } catch (error) {
      toast.error('Failed to resend verification email. Please try again.');
      console.error('Error resending verification email:', error);
    } finally {
      setIsResending(false);
    }
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
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleResendVerification}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
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
