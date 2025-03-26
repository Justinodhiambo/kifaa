
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const Loans = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Loans</h1>
      
      <Tabs defaultValue="current" className="mb-8">
        <TabsList>
          <TabsTrigger value="current">Current Loans</TabsTrigger>
          <TabsTrigger value="apply">Apply for a Loan</TabsTrigger>
          <TabsTrigger value="history">Loan History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Loans</CardTitle>
              <CardDescription>Your active loans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-gray-500 italic">
                You don't have any active loans
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="apply" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Apply for a Loan</CardTitle>
              <CardDescription>Fill in the details to apply for a loan</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="loanAmount" className="text-sm font-medium">Loan Amount (KES)</label>
                  <Input id="loanAmount" type="number" placeholder="Enter loan amount" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="loanPurpose" className="text-sm font-medium">Loan Purpose</label>
                  <Input id="loanPurpose" placeholder="What do you need the loan for?" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="loanTerm" className="text-sm font-medium">Term (Months)</label>
                  <Input id="loanTerm" type="number" min="1" max="36" placeholder="Loan term in months" />
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Loan Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Interest Rate:</span>
                      <span className="font-medium">12% per annum</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Payment:</span>
                      <span className="font-medium">KES 0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Repayment:</span>
                      <span className="font-medium">KES 0.00</span>
                    </div>
                  </div>
                </div>
                
                <Button>Apply Now</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Loan History</CardTitle>
              <CardDescription>Your previous loans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-gray-500 italic">
                No loan history found
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Credit Score</CardTitle>
          <CardDescription>Your current credit rating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="relative h-36 w-36 flex items-center justify-center rounded-full border-8 border-gray-100">
              <div className="text-center">
                <div className="text-4xl font-bold">650</div>
                <div className="text-sm text-gray-500">Good</div>
              </div>
            </div>
            
            <div className="w-full max-w-md">
              <div className="flex justify-between mb-2 text-sm">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            
            <div className="text-sm text-gray-500 max-w-md text-center mt-4">
              Your credit score is calculated based on your payment history, loan utilization, and account age.
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="font-medium mb-4">Tips to improve your credit score:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Make all loan repayments on time</li>
              <li>Keep your loan utilization low</li>
              <li>Maintain a longer account history</li>
              <li>Avoid multiple loan applications in a short period</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Loans;
