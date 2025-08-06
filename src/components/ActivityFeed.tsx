import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, TrendingUp, Wallet, Building, Trophy, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Activity {
  id: string;
  type: 'score' | 'wallet' | 'asset' | 'achievement' | 'partner';
  title: string;
  description: string;
  timestamp: Date;
  isNew: boolean;
  icon: React.ReactNode;
  actionable?: boolean;
}

const ActivityFeed = () => {
  const [filter, setFilter] = useState<'all' | 'score' | 'wallet' | 'asset' | 'achievement'>('all');

  const activities: Activity[] = [
    {
      id: '1',
      type: 'score',
      title: 'Credit Score Increased',
      description: 'Your score improved by 18 points after linking your mobile wallet',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isNew: true,
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      actionable: false
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Bronze Savings Badge Earned',
      description: 'Congratulations! You maintained savings for 30 consecutive days',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      isNew: true,
      icon: <Trophy className="h-4 w-4 text-yellow-500" />,
      actionable: false
    },
    {
      id: '3',
      type: 'asset',
      title: 'New Asset Available',
      description: 'You now qualify for solar panel financing through GreenTech SACCO',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isNew: false,
      icon: <Building className="h-4 w-4 text-blue-500" />,
      actionable: true
    },
    {
      id: '4',
      type: 'wallet',
      title: 'Large Deposit Detected',
      description: 'KES 15,000 deposit from salary - this positively impacts your score',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isNew: false,
      icon: <Wallet className="h-4 w-4 text-green-500" />,
      actionable: false
    },
    {
      id: '5',
      type: 'asset',
      title: 'Application Status Update',
      description: 'ABC SACCO has approved your motorcycle financing application',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isNew: false,
      icon: <Building className="h-4 w-4 text-green-500" />,
      actionable: true
    },
    {
      id: '6',
      type: 'score',
      title: 'Score Analysis Complete',
      description: 'Your monthly credit assessment is ready with new recommendations',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      isNew: false,
      icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
      actionable: true
    }
  ];

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'score': return 'Credit Score';
      case 'wallet': return 'Wallet';
      case 'asset': return 'Asset Financing';
      case 'achievement': return 'Achievement';
      case 'partner': return 'Partner';
      default: return 'Activity';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'score': return 'bg-blue-100 text-blue-800';
      case 'wallet': return 'bg-green-100 text-green-800';
      case 'asset': return 'bg-purple-100 text-purple-800';
      case 'achievement': return 'bg-yellow-100 text-yellow-800';
      case 'partner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const newActivitiesCount = activities.filter(a => a.isNew).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Activity Feed</CardTitle>
            {newActivitiesCount > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {newActivitiesCount} new
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>Stay updated with your financial progress</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="score">Score</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="asset">Assets</TabsTrigger>
            <TabsTrigger value="achievement">Badges</TabsTrigger>
          </TabsList>
          
          <TabsContent value={filter} className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activities in this category yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`p-4 rounded-lg border transition-colors ${
                      activity.isNew ? 'bg-blue-50/50 border-blue-200' : 'bg-background border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 bg-background border">
                        {activity.icon}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{activity.title}</h4>
                              {activity.isNew && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                          
                          <Badge className={getTypeColor(activity.type)}>
                            {getTypeLabel(activity.type)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {format(activity.timestamp, 'MMM dd, yyyy • h:mm a')}
                          </span>
                          
                          {activity.actionable && (
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;