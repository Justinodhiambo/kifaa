
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share, Copy, Mail, MessageSquare } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const Refer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Referral link and code
  const referralLink = 'https://kifaa.io/register?ref=WK12345';
  const referralCode = 'WK12345';
  
  // Handle copy to clipboard
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard.`,
        duration: 3000,
      });
    }).catch(err => {
      toast({
        title: "Error",
        description: "Failed to copy. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    });
  };
  
  // Handle email invite
  const handleEmailInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Show success message (in real app, this would make an API call)
    toast({
      title: "Invitation Sent!",
      description: `Invitation email sent to ${email}.`,
      duration: 3000,
    });
    setEmail('');
  };
  
  // Handle SMS invite
  const handleSMSInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast({
        title: "Error",
        description: "Please enter a phone number.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Show success message (in real app, this would make an API call)
    toast({
      title: "Invitation Sent!",
      description: `Invitation SMS sent to ${phone}.`,
      duration: 3000,
    });
    setPhone('');
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Refer a Friend</h1>
      <p className="text-muted-foreground mb-8">Share Kifaa with friends and earn rewards when they join</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Share Your Referral Link</CardTitle>
            <CardDescription>
              When friends sign up using your referral link, you both get rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
              <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {referralLink}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleCopy(referralLink, 'Referral link')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Your Referral Code:</p>
              <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                <div className="font-mono font-medium">{referralCode}</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleCopy(referralCode, 'Referral code')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <Button className="flex items-center gap-2">
                <Share className="h-4 w-4" /> 
                Share on Social Media
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> 
                Share via Email
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> 
                Share via SMS
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Rewards</CardTitle>
            <CardDescription>Track your referral rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-4xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Successful Referrals</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Pending Rewards:</span>
                  <span className="font-medium">KES 0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Earned:</span>
                  <span className="font-medium">KES 0.00</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-center text-muted-foreground">
              Earn KES 500 for each friend who signs up and completes their first transaction
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Invite Friends Directly</CardTitle>
          <CardDescription>Send personalized invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email">
            <TabsList className="mb-4">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <form onSubmit={handleEmailInvite} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Friend's Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your friend's email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit">Send Invitation</Button>
              </form>
            </TabsContent>
            
            <TabsContent value="sms">
              <form onSubmit={handleSMSInvite} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Friend's Phone Number</label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="Enter your friend's phone number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <Button type="submit">Send SMS</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>Your referral activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-gray-500 italic">
            You haven't referred anyone yet
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Refer;
