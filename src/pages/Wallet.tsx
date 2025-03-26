
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Wallet = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Wallet</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>KES Balance</CardTitle>
            <CardDescription>Available funds</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">KES 0.00</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>USD Balance</CardTitle>
            <CardDescription>Available funds</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">USD 0.00</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>EUR Balance</CardTitle>
            <CardDescription>Available funds</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">EUR 0.00</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="deposit" className="mb-8">
        <TabsList>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="deposit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Funds</CardTitle>
              <CardDescription>Add money to your wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="depositAmount" className="text-sm font-medium">Amount</label>
                  <Input id="depositAmount" type="number" placeholder="Enter amount" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="depositCurrency" className="text-sm font-medium">Currency</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">KES</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="depositMethod" className="text-sm font-medium">Payment Method</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="card">Debit/Credit Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Proceed</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="withdraw" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
              <CardDescription>Withdraw money from your wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="withdrawAmount" className="text-sm font-medium">Amount</label>
                  <Input id="withdrawAmount" type="number" placeholder="Enter amount" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="withdrawCurrency" className="text-sm font-medium">Currency</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">KES</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="withdrawMethod" className="text-sm font-medium">Withdrawal Method</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="bank">Bank Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Withdraw</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transfer" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Funds</CardTitle>
              <CardDescription>Transfer money to another user</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="recipientEmail" className="text-sm font-medium">Recipient Email</label>
                  <Input id="recipientEmail" type="email" placeholder="Enter recipient's email" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="transferAmount" className="text-sm font-medium">Amount</label>
                  <Input id="transferAmount" type="number" placeholder="Enter amount" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="transferCurrency" className="text-sm font-medium">Currency</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">KES</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="transferNote" className="text-sm font-medium">Note (Optional)</label>
                  <Input id="transferNote" placeholder="Add a note" />
                </div>
                <Button>Transfer</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent transactions in your wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500 italic">
            No transactions found
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
