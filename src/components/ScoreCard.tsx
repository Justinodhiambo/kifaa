import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreCardProps {
  score: number;
  previousScore?: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  breakdown: {
    income_consistency: number;
    wallet_behavior: number;
    repayment_history: number;
    savings_activity: number;
    platform_tenure: number;
  };
}

const ScoreCard = ({ score, previousScore, tier, breakdown }: ScoreCardProps) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'bg-amber-100 text-amber-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreChange = () => {
    if (!previousScore) return null;
    const change = score - previousScore;
    if (change > 0) return { icon: TrendingUp, text: `+${change}`, color: 'text-green-500' };
    if (change < 0) return { icon: TrendingDown, text: `${change}`, color: 'text-red-500' };
    return { icon: Minus, text: '0', color: 'text-gray-500' };
  };

  const scoreChange = getScoreChange();
  const nextTierThreshold = tier === 'Bronze' ? 650 : tier === 'Silver' ? 700 : tier === 'Gold' ? 750 : 800;
  const progressToNext = Math.min(((score - (nextTierThreshold - 100)) / 100) * 100, 100);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Credit Score</CardTitle>
          <Badge className={getTierColor(tier)}>{tier}</Badge>
        </div>
        <CardDescription>AI-powered financial assessment</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-bold">{score}</span>
          {scoreChange && (
            <div className={`flex items-center space-x-1 ${scoreChange.color}`}>
              <scoreChange.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{scoreChange.text}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to {tier === 'Platinum' ? 'Maximum' : 'Next Tier'}</span>
            <span>{Math.round(progressToNext)}%</span>
          </div>
          <Progress value={progressToNext} className="h-2" />
        </div>
        
        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-medium">Score Breakdown</h4>
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm capitalize">
                {key.replace(/_/g, ' ')}
              </span>
              <div className="flex items-center space-x-2">
                <Progress value={value} className="w-16 h-1" />
                <span className="text-xs text-muted-foreground w-8">{value}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreCard;