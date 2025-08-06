import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from 'lucide-react';

interface MobileScoreCardProps {
  score: number;
  tier: string;
  nextAction: string;
  breakdown: {
    income_consistency: number;
    wallet_behavior: number;
    repayment_history: number;
    savings_activity: number;
  };
}

const MobileScoreCard = ({ score, tier, nextAction, breakdown }: MobileScoreCardProps) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'bg-amber-100 text-amber-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Score Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/20 to-transparent rounded-full -translate-y-12 translate-x-12" />
        
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <Badge className={getTierColor(tier)}>{tier} Tier</Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-4xl font-bold">{score}</div>
              <p className="text-sm text-muted-foreground">Income consistency is good</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Best Action */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Next Best Action</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">{nextAction}</p>
            </div>
            <Button size="sm" variant="ghost">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Score View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Score</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getTierColor(tier)}>{tier} Tier</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{score}</div>
              <p className="text-xs text-muted-foreground">{tier} Tier</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Circular Progress Representation */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="10"
                  strokeDasharray={`${(score / 850) * 283} 283`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold">{score}</div>
                  <div className="text-xs text-muted-foreground">of 850</div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Score Breakdown</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Income consistency</span>
                  <span>{breakdown.income_consistency}%</span>
                </div>
                <Progress value={breakdown.income_consistency} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Wallet activity</span>
                  <span>{breakdown.wallet_behavior}%</span>
                </div>
                <Progress value={breakdown.wallet_behavior} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Savings activity</span>
                  <span>{breakdown.savings_activity}%</span>
                </div>
                <Progress value={breakdown.savings_activity} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Savings activity</span>
                  <span>{breakdown.repayment_history}%</span>
                </div>
                <Progress value={breakdown.repayment_history} className="h-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Improve */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How to Improve</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <p className="font-medium mb-2">Your score could improve by 25 points!</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <TrendingUp className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                <span>Link your existing revenue accounts</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                <span>Deposit savings regularly</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                <span>Increase your monthly savings</span>
              </li>
            </ul>
          </div>
          
          <div className="pt-2">
            <div className="text-xs font-medium mb-2">Personal Score Improvement Plan</div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Add a savings wallet</li>
              <li>• Reduce bounced transactions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileScoreCard;