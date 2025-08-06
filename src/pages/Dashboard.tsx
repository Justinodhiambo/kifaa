import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from '@/hooks/use-financial';
import { useAuth } from '@/hooks/use-auth';
import { Wallet, CreditCard, BanknoteIcon, ArrowUpRight, ArrowDownLeft, Clock, TrendingUp, Users, Target } from 'lucide-react';
import { format } from 'date-fns';
import LaptopFrame from '@/components/LaptopFrame';
import ScoreCard from '@/components/ScoreCard';
import AssetMarketplace from '@/components/AssetMarketplace';
import ScoreImprovementPlan from '@/components/ScoreImprovementPlan';
import ActivityFeed from '@/components/ActivityFeed';

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const { wallets, transactions, loans, creditScore, isLoading } = useFinancial();
  const [laptopVariant, setLaptopVariant] = useState<'macbook' | 'windows'>('macbook');
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'plan' | 'activity'>('overview');

  // Mock data for enhanced features
  const userTier = 'Silver';
  const nextTier = 'Gold';
  const scoreBreakdown = {
    income_consistency: 75,
    wallet_behavior: 82,
    repayment_history: 90,
    savings_activity: 65,
    platform_tenure: 58
  };

  // Get KES wallet balance
  const kesWalletBalance = wallets?.find(w => w.currency === 'KES')?.balance || 0;
  
  // Get active loans count
  const activeLoansCount = loans?.filter(loan => 
    ['disbursed', 'repaying'].includes(loan.status)).length || 0;

  // Get recent transactions (last 5)
  const recentTransactions = transactions?.slice(0, 5) || [];
  
  // Calculate profile completion
  const profileFields = [
    userProfile?.first_name,
    userProfile?.last_name,
    userProfile?.phone,
    userProfile?.date_of_birth,
    userProfile?.gender,
    userProfile?.address
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

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

  const toggleLaptopVariant = () => {
    setLaptopVariant(prev => prev === 'macbook' ? 'windows' : 'macbook');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <header>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">
              Welcome back, {userProfile?.first_name || user?.email?.split('@')[0] || 'User'}!
            </h1>
            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white">
              {userTier} Tier
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Your financial dashboard • Profile {profileCompletion}% complete
          </p>
        </header>
        <button 
          onClick={toggleLaptopVariant} 
          className="px-4 py-2 rounded-md bg-primary text-white text-sm"
        >
          Switch to {laptopVariant === 'macbook' ? 'Windows' : 'MacBook'} Style
        </button>
      </div>

      {/* Quick Action Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'marketplace', label: 'Asset Marketplace', icon: Users },
          { id: 'plan', label: 'Improvement Plan', icon: Target },
          { id: 'activity', label: 'Activity Feed', icon: Clock }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === id 
                ? 'bg-primary text-white' 
                : 'bg-background border hover:bg-accent'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
      
      <LaptopFrame variant={laptopVariant}>
        <div className="p-4 overflow-auto max-h-[calc(100vh-220px)]">
          {activeTab === 'overview' && (
            <>
              {/* Enhanced Overview Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                    <CardTitle className="text-sm font-medium">Eligible Offers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Asset financing options
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{profileCompletion}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Complete for better offers
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <ScoreCard 
                    score={creditScore || 672}
                    previousScore={654}
                    tier={userTier as any}
                    breakdown={scoreBreakdown}
                  />
                </div>
                
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
              </div>
              
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Manage your finances efficiently</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <a 
                        href="/wallet" 
                        className="p-4 text-center rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Wallet className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Fund Wallet</span>
                      </a>
                      <a 
                        href="/loans" 
                        className="p-4 text-center rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <CreditCard className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Apply for Loan</span>
                      </a>
                      <a 
                        href="/products" 
                        className="p-4 text-center rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Users className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Browse Assets</span>
                      </a>
                      <a 
                        href="/profile" 
                        className="p-4 text-center rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Target className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Complete Profile</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
          
          {activeTab === 'marketplace' && (
            <AssetMarketplace />
          )}
          
          {activeTab === 'plan' && (
            <ScoreImprovementPlan 
              currentScore={creditScore || 672}
              currentTier={userTier}
              nextTier={nextTier}
              pointsToNextTier={28}
            />
          )}
          
          {activeTab === 'activity' && (
            <ActivityFeed />
          )}
        </div>
      </LaptopFrame>
    </div>
  );
};

export default Dashboard;
