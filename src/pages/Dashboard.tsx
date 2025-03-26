
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFinancial } from '@/hooks/use-financial';
import { useAuth } from '@/hooks/use-auth';
import { Wallet, CreditCard, BanknoteIcon, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const { wallets, transactions, loans, creditScore, isLoading } = useFinancial();

  // Get KES wallet balance
  const kesWalletBalance = wallets?.find(w => w.currency === 'KES')?.balance || 0;
  
  // Get active loans count
  const activeLoansCount = loans?.filter(loan => 
    ['disbursed', 'repaying'].includes(loan.status)).length || 0;

  // Get recent transactions (last 5)
  const recentTransactions = transactions?.slice(0, 5) || [];

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {userProfile?.first_name || user?.email?.split('@')[0] || 'User'}
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 'Loading...' : formatCurrency(kesWalletBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? 'Loading...' : activeLoansCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeLoansCount === 1 ? 'Current loan' : 'Current loans'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? 'Loading...' : creditScore || 'N/A'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {creditScore && creditScore > 700 ? 'Excellent' : creditScore && creditScore > 650 ? 'Good' : creditScore && creditScore > 600 ? 'Fair' : creditScore ? 'Needs improvement' : 'Not available'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading transactions...</p>
            ) : recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No recent transactions</p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full p-2 bg-gray-100 dark:bg-gray-800">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.description || transaction.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.created_at ? format(new Date(transaction.created_at), 'dd MMM yyyy, h:mm a') : ''}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${transaction.type === 'deposit' ? 'text-green-500' : transaction.type === 'withdrawal' ? 'text-red-500' : ''}`}>
                      {transaction.type === 'deposit' ? '+' : transaction.type === 'withdrawal' ? '-' : ''}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your finances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a 
              href="/wallet" 
              className="block w-full p-3 text-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Fund Wallet
            </a>
            <a 
              href="/loans" 
              className="block w-full p-3 text-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Apply for Loan
            </a>
            <a 
              href="/products" 
              className="block w-full p-3 text-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Browse Products
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
