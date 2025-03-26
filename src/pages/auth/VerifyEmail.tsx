
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const VerifyEmail = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>We've sent a verification link to your email</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>
            Please check your email and click the verification link to complete your registration.
          </p>
          <p>
            If you don't see the email, please check your spam folder.
          </p>
          <Button variant="outline" className="mt-4">
            Resend Verification Email
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm">
            Already verified?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
