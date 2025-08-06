import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from '@/hooks/use-financial';
import { useAuth } from '@/hooks/use-auth';
import { Wallet, CreditCard, BanknoteIcon, ArrowUpRight, ArrowDownLeft, Clock, TrendingUp, Users, Target } from 'lucide-react';
import { format } from 'date-fns';
import LaptopFrame from '@/components/LaptopFrame';
import MobileScoreCard from '@/components/MobileScoreCard';
import CompactAssetMarketplace from '@/components/CompactAssetMarketplace';
import WalletInsights from '@/components/WalletInsights';
import ScoreImprovementPlan from '@/components/ScoreImprovementPlan';
import ActivityFeed from '@/components/ActivityFeed';

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const { wallets, transactions, loans, creditScore, isLoading } = useFinancial();
  const [laptopVariant, setLaptopVariant] = useState<'macbook' | 'windows'>('macbook');
  const [activeView, setActiveView] = useState<'welcome' | 'score' | 'assets' | 'wallet'>('welcome');

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
    <div className="max-w-md mx-auto bg-background min-h-screen">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Kifaa</div>
          <div className="flex gap-2">
            {['welcome', 'score', 'assets', 'wallet'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view as any)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  activeView === view ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Mobile Content */}
      <div className="p-4 pb-20">
        {activeView === 'welcome' && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {userProfile?.first_name || 'Akinyi'}!
              </h1>
            </div>
            
            <MobileScoreCard 
              score={creditScore || 672}
              tier={userTier}
              nextAction="Improve your score by linking your wallet"
              breakdown={scoreBreakdown}
            />
          </div>
        )}
        
        {activeView === 'score' && (
          <div className="space-y-4">
            <MobileScoreCard 
              score={creditScore || 672}
              tier={userTier}
              nextAction="Improve your score by linking your wallet"
              breakdown={scoreBreakdown}
            />
          </div>
        )}
        
        {activeView === 'assets' && (
          <CompactAssetMarketplace />
        )}
        
        {activeView === 'wallet' && (
          <WalletInsights 
            balance={kesWalletBalance}
            currency="KES"
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            {[
              { id: 'welcome', label: 'Home', icon: '🏠' },
              { id: 'score', label: 'Score', icon: '📊' },
              { id: 'assets', label: 'Assets', icon: '🏦' },
              { id: 'wallet', label: 'Wallet', icon: '💳' }
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id as any)}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                  activeView === id 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
