import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Plus, Minus } from 'lucide-react';

interface WalletInsightsProps {
  balance: number;
  currency: string;
}

const WalletInsights = ({ balance, currency }: WalletInsightsProps) => {
  // Mock data for wallet trends
  const monthlyData = [
    { month: 'Jan', inflow: 8000, outflow: 6500 },
    { month: 'Feb', inflow: 9500, outflow: 7200 },
    { month: 'Mar', inflow: 7800, outflow: 6800 },
    { month: 'Apr', inflow: 11000, outflow: 8200 },
    { month: 'May', inflow: 10200, outflow: 7500 },
    { month: 'Jun', inflow: 12500, outflow: 9100 }
  ];

  const insights = [
    {
      title: "You spend 60% on utility bills",
      description: "Your main expense category this month",
      type: "expense"
    },
    {
      title: "Deposits from income sources: 2 per month",
      description: "Regular income pattern detected",
      type: "income"
    },
    {
      title: "Average monthly savings: KES 540",
      description: "Consistent saving behavior",
      type: "savings"
    },
    {
      title: "Most active days: Mondays",
      description: "Transaction pattern analysis",
      type: "pattern"
    }
  ];

  const scoreNudges = [
    "Saving at least KES 200/week improves your score",
    "Reducing bounced transactions can increase score by 15 points",
    "Linking additional income sources boosts reliability score"
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Balance
          </CardTitle>
          <CardDescription>{currency} Balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-4">
            {formatCurrency(balance)}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
            <Button variant="outline" className="flex-1">
              <Minus className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Wallet Trends</CardTitle>
          <CardDescription>Inflows vs outflows over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Bar dataKey="inflow" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="outflow" fill="hsl(var(--muted))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded" />
              <span>Inflows</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded" />
              <span>Outflows</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Insights</CardTitle>
          <CardDescription>Understanding your spending patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-primary/10">
                {insight.type === 'expense' && <TrendingDown className="h-4 w-4 text-red-500" />}
                {insight.type === 'income' && <TrendingUp className="h-4 w-4 text-green-500" />}
                {insight.type === 'savings' && <Wallet className="h-4 w-4 text-blue-500" />}
                {insight.type === 'pattern' && <BarChart className="h-4 w-4 text-purple-500" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{insight.title}</p>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Wallet-linked Score Nudges */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet-linked Score Nudges</CardTitle>
          <CardDescription>Actions to improve your credit score</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {scoreNudges.map((nudge, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-sm">{nudge}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletInsights;