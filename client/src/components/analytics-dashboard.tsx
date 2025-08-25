
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Activity, 
  Target,
  Globe,
  Zap,
  Shield,
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

interface AnalyticsData {
  userStats: {
    totalUsers: number;
    activeToday: number;
    newThisWeek: number;
    retentionRate: number;
  };
  botUsage: {
    totalSessions: number;
    averageSessionTime: number;
    mostPopularBot: string;
    successRate: number;
  };
  verification: {
    totalVerifications: number;
    successfulVerifications: number;
    failedAttempts: number;
    averageVerificationTime: number;
  };
  performance: {
    systemUptime: number;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
  gameStats: {
    mostPlayedGames: Array<{ name: string; sessions: number; percentage: number }>;
    peakHours: Array<{ hour: number; users: number }>;
  };
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = () => {
    // Simulate analytics data - in real app, fetch from API
    const mockData: AnalyticsData = {
      userStats: {
        totalUsers: 1247,
        activeToday: 89,
        newThisWeek: 156,
        retentionRate: 73.2
      },
      botUsage: {
        totalSessions: 3456,
        averageSessionTime: 8.5,
        mostPopularBot: 'FlareBot_V1',
        successRate: 94.7
      },
      verification: {
        totalVerifications: 2341,
        successfulVerifications: 2198,
        failedAttempts: 143,
        averageVerificationTime: 2.3
      },
      performance: {
        systemUptime: 99.8,
        responseTime: 0.12,
        errorRate: 0.03,
        activeConnections: 47
      },
      gameStats: {
        mostPlayedGames: [
          { name: 'Blox Fruits', sessions: 1234, percentage: 35.7 },
          { name: 'Pet Simulator X', sessions: 987, percentage: 28.6 },
          { name: 'Adopt Me', sessions: 765, percentage: 22.1 },
          { name: 'Arsenal', sessions: 470, percentage: 13.6 }
        ],
        peakHours: [
          { hour: 14, users: 125 },
          { hour: 15, users: 145 },
          { hour: 16, users: 178 },
          { hour: 17, users: 156 },
          { hour: 18, users: 189 },
          { hour: 19, users: 203 },
          { hour: 20, users: 167 }
        ]
      }
    };

    setAnalytics(mockData);
    setIsLoading(false);
    setLastUpdate(new Date());
  };

  const exportData = () => {
    if (!analytics) return;
    
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Analytics Dashboard</h1>
          <p className="text-gray-600">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData} className="bg-orange hover:bg-orange-dark text-white">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="bots">Bot Usage</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.userStats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    +{analytics.userStats.newThisWeek} this week
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.botUsage.successRate}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={analytics.botUsage.successRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Today</p>
                    <p className="text-2xl font-bold text-orange-600">{analytics.userStats.activeToday}</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-500" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-green-600 font-medium">↑ 12% vs yesterday</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Uptime</p>
                    <p className="text-2xl font-bold text-purple-600">{analytics.performance.systemUptime}%</p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Excellent
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm text-gray-600">{analytics.performance.responseTime}s</span>
                </div>
                <Progress value={analytics.performance.responseTime * 100} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Error Rate</span>
                  <span className="text-sm text-gray-600">{analytics.performance.errorRate}%</span>
                </div>
                <Progress value={analytics.performance.errorRate} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Connections</span>
                  <span className="text-sm text-gray-600">{analytics.performance.activeConnections}</span>
                </div>
                <Progress value={(analytics.performance.activeConnections / 100) * 100} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <span>Top Games</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.gameStats.mostPlayedGames.map((game, index) => (
                  <div key={game.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{game.name}</span>
                      <span className="text-sm text-gray-600">{game.sessions} sessions</span>
                    </div>
                    <Progress value={game.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {analytics.userStats.totalUsers}
                </div>
                <p className="text-sm text-gray-600">Total registered users</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Retention Rate</span>
                    <span>{analytics.userStats.retentionRate}%</span>
                  </div>
                  <Progress value={analytics.userStats.retentionRate} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {analytics.userStats.activeToday}
                </div>
                <p className="text-sm text-gray-600">Users active today</p>
                <Badge className="mt-4 bg-green-100 text-green-800">
                  ↑ 8.3% from yesterday
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>New Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {analytics.userStats.newThisWeek}
                </div>
                <p className="text-sm text-gray-600">New users this week</p>
                <Badge className="mt-4 bg-orange-100 text-orange-800">
                  Weekly goal: 150
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bots" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bot Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Total Sessions</span>
                    <span className="text-lg font-bold">{analytics.botUsage.totalSessions}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Avg Session Time</span>
                    <span className="text-lg font-bold">{analytics.botUsage.averageSessionTime} min</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Most Popular</span>
                    <span className="text-lg font-bold">{analytics.botUsage.mostPopularBot}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verification Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.verification.successfulVerifications}
                    </div>
                    <p className="text-sm text-gray-600">Successful</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {analytics.verification.failedAttempts}
                    </div>
                    <p className="text-sm text-gray-600">Failed</p>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Avg Time</span>
                    <span className="text-sm font-bold">{analytics.verification.averageVerificationTime} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="games" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.gameStats.mostPlayedGames.map((game, index) => (
                  <div key={game.name} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{game.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{game.sessions}</div>
                        <div className="text-sm text-gray-600">{game.percentage}%</div>
                      </div>
                    </div>
                    <Progress value={game.percentage} className="h-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
