import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, TrendingUp, Trophy, Target } from 'lucide-react';

interface ImprovementAction {
  id: string;
  title: string;
  description: string;
  impact: number; // points increase
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  timeframe: string;
}

interface ScoreImprovementPlanProps {
  currentScore: number;
  currentTier: string;
  nextTier: string;
  pointsToNextTier: number;
}

const ScoreImprovementPlan = ({ 
  currentScore, 
  currentTier, 
  nextTier, 
  pointsToNextTier 
}: ScoreImprovementPlanProps) => {
  const [actions, setActions] = React.useState<ImprovementAction[]>([
    {
      id: '1',
      title: 'Link Mobile Money Wallet',
      description: 'Connect your M-Pesa or Airtel Money for transaction history analysis',
      impact: 25,
      difficulty: 'Easy',
      completed: false,
      timeframe: '5 minutes'
    },
    {
      id: '2',
      title: 'Maintain Stable Monthly Savings',
      description: 'Save at least KES 500 monthly for 3 consecutive months',
      impact: 35,
      difficulty: 'Medium',
      completed: false,
      timeframe: '3 months'
    },
    {
      id: '3',
      title: 'Upload Proof of Income',
      description: 'Submit salary slip or business income documentation',
      impact: 20,
      difficulty: 'Easy',
      completed: true,
      timeframe: '10 minutes'
    },
    {
      id: '4',
      title: 'Complete Financial Literacy Course',
      description: 'Finish our 8-module course on financial management',
      impact: 15,
      difficulty: 'Medium',
      completed: false,
      timeframe: '2 weeks'
    },
    {
      id: '5',
      title: 'Reduce Transaction Bounces',
      description: 'Avoid insufficient fund transactions for 60 days',
      impact: 30,
      difficulty: 'Hard',
      completed: false,
      timeframe: '2 months'
    }
  ]);

  const completedActions = actions.filter(action => action.completed);
  const pendingActions = actions.filter(action => !action.completed);
  const totalPossibleImpact = pendingActions.reduce((sum, action) => sum + action.impact, 0);
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleAction = (id: string) => {
    setActions(prev => prev.map(action => 
      action.id === id ? { ...action, completed: !action.completed } : action
    ));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Your Score Roadmap</CardTitle>
          </div>
          <CardDescription>
            Personalized plan to improve your credit score
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Score</p>
              <p className="text-2xl font-bold">{currentScore}</p>
              <Badge variant="outline">{currentTier}</Badge>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">+{totalPossibleImpact} points possible</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Target Score</p>
              <p className="text-2xl font-bold">{currentScore + pointsToNextTier}</p>
              <Badge className="bg-primary/10 text-primary">{nextTier}</Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {nextTier}</span>
              <span>{Math.max(0, pointsToNextTier - totalPossibleImpact)} points needed</span>
            </div>
            <Progress 
              value={Math.min(100, (totalPossibleImpact / pointsToNextTier) * 100)} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Improvement Actions</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>{completedActions.length} of {actions.length} completed</span>
          </div>
        </div>

        {actions.map((action) => (
          <Card key={action.id} className={action.completed ? 'border-green-200 bg-green-50/50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => toggleAction(action.id)}
                  className="mt-1 focus:outline-none"
                >
                  {action.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-primary transition-colors" />
                  )}
                </button>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-medium ${action.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {action.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Badge className={getDifficultyColor(action.difficulty)}>
                        {action.difficulty}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">+{action.impact} pts</p>
                        <p className="text-xs text-muted-foreground">{action.timeframe}</p>
                      </div>
                    </div>
                  </div>
                  
                  {!action.completed && (
                    <Button size="sm" variant="outline">
                      Start Action
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScoreImprovementPlan;