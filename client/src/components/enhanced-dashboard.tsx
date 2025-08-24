import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bot, Users, Trophy, Clock, Star, Bell, Search, 
  BarChart3, Gamepad2, Timer, Award, Heart,
  TrendingUp, Activity, Zap, Shield, Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  robloxUsername: string;
  displayName?: string;
  bio?: string;
  totalSessions: number;
  totalPlayTime: number;
  reputation: number;
  isVip: boolean;
  favoriteGames: string[];
  preferredModes: string[];
  lastActiveAt: Date;
}

interface BotStatus {
  name: string;
  isInUse: boolean;
  currentUser?: string;
  utilization: number;
}

interface Achievement {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

interface QueueStatus {
  id: string;
  botName: string;
  queuePosition: number;
  estimatedWaitTime: number;
}

interface SessionHistory {
  id: string;
  botName: string;
  game: string;
  mode: string;
  duration?: number;
  rating?: number;
  feedback?: string;
  startTime: Date;
  status: string;
}

export default function EnhancedDashboard({ username }: { username: string }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch user profile
  const { data: profile } = useQuery<UserProfile>({
    queryKey: [`/api/profile/${username}`],
    refetchInterval: 30000,
  });

  // Fetch real-time status
  const { data: realTimeStatus } = useQuery<{
    bots: BotStatus[];
    totalUsers: number;
    activeUsers: number;
    systemLoad: number;
    uptime: string;
  }>({
    queryKey: ["/api/status/realtime"],
    refetchInterval: 5000,
  });

  // Fetch achievements
  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: [`/api/achievements/${username}`],
  });

  // Fetch notifications
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: [`/api/notifications/${profile?.id}`],
    enabled: !!profile?.id,
    refetchInterval: 10000,
  });

  // Fetch queue status
  const { data: queueStatus } = useQuery<QueueStatus[]>({
    queryKey: [`/api/queue/status/${profile?.id}`],
    enabled: !!profile?.id,
    refetchInterval: 5000,
  });

  // Fetch session history
  const { data: sessionHistory } = useQuery<SessionHistory[]>({
    queryKey: [`/api/sessions/${profile?.id}`],
    enabled: !!profile?.id,
  });

  // Fetch leaderboard
  const { data: leaderboard } = useQuery<Array<{
    username: string;
    totalSessions: number;
    totalPlayTime: number;
    reputation: number;
    isVip: boolean;
  }>>({
    queryKey: ["/api/leaderboard"],
    refetchInterval: 60000,
  });

  const joinQueue = async (botName: string, game: string, mode: string) => {
    if (!profile) return;
    
    try {
      const response = await fetch("/api/queue/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          botName,
          game,
          mode
        }),
      });
      
      const result = await response.json();
      
      if (result.queued) {
        toast({
          title: "Added to Queue!",
          description: `Position ${result.position}. Estimated wait: ${result.estimatedWait} minutes.`,
        });
      } else {
        toast({
          title: "Session Started!",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join queue",
        variant: "destructive",
      });
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const unreadNotifications = notifications?.filter(n => !n.isRead) || [];

  return (
    <div className="font-roboto min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-4 border-primary">
              <AvatarFallback className="bg-primary text-white text-xl font-bold">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                {profile?.displayName || username}
                {profile?.isVip && <Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500">VIP</Badge>}
              </h1>
              <p className="text-gray-600">
                {profile?.totalSessions || 0} sessions • {Math.floor((profile?.totalPlayTime || 0) / 60)}h playtime
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications Bell */}
            <Button
              variant="outline"
              size="sm"
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-xs">
                  {unreadNotifications.length}
                </Badge>
              )}
            </Button>
            
            {/* System Status */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">System {realTimeStatus?.uptime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reputation</p>
                  <p className="text-2xl font-bold text-blue-600">{profile?.reputation || 0}</p>
                </div>
                <Trophy className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Queue Position</p>
                  <p className="text-2xl font-bold text-green-600">
                    {queueStatus?.length ? `#${queueStatus[0].queuePosition}` : "None"}
                  </p>
                </div>
                <Timer className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Achievements</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {achievements?.filter(a => a.unlocked).length || 0}
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-orange-600">{realTimeStatus?.activeUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="bots" className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>Bots</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Real-time Bot Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <span>Real-time Bot Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {realTimeStatus?.bots.map((bot) => (
                    <div key={bot.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${bot.isInUse ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <div>
                          <p className="font-medium">{bot.name}</p>
                          <p className="text-sm text-gray-600">
                            {bot.isInUse ? `In use by ${bot.currentUser}` : 'Available'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{bot.utilization}%</p>
                        <Progress value={bot.utilization} className="w-20" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <span>Recent Notifications</span>
                    {unreadNotifications.length > 0 && (
                      <Badge variant="destructive">{unreadNotifications.length} new</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications?.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border-l-4 cursor-pointer ${
                        notification.isRead 
                          ? 'border-l-gray-300 bg-gray-50' 
                          : 'border-l-primary bg-blue-50'
                      }`}
                      onClick={() => markNotificationRead(notification.id)}
                      data-testid={`notification-${notification.id}`}
                    >
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )) || <p className="text-gray-500 text-center py-4">No notifications</p>}
                </CardContent>
              </Card>
            </div>

            {/* Current Queue Status */}
            {queueStatus && queueStatus.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Timer className="h-5 w-5 text-primary" />
                    <span>Current Queue Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {queueStatus.map((queue) => (
                      <div key={queue.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div>
                          <p className="font-medium">{queue.botName}</p>
                          <p className="text-sm text-gray-600">Position #{queue.queuePosition}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-yellow-600">
                            ~{queue.estimatedWaitTime} min wait
                          </p>
                          <Button variant="outline" size="sm" className="mt-1">
                            Leave Queue
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Enhanced Bot Selection Tab */}
          <TabsContent value="bots" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Bots</CardTitle>
                <p className="text-sm text-gray-600">Select a bot to start gaming or join the queue</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {realTimeStatus?.bots.map((bot) => (
                    <Card key={bot.name} className={`cursor-pointer transition-all ${
                      selectedBot === bot.name ? 'ring-2 ring-primary' : ''
                    } ${bot.isInUse ? 'opacity-75' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${bot.isInUse ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            <h3 className="font-bold text-lg">{bot.name}</h3>
                          </div>
                          {bot.isInUse && <Badge variant="destructive">In Use</Badge>}
                          {!bot.isInUse && <Badge variant="secondary">Available</Badge>}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Utilization</p>
                            <Progress value={bot.utilization} className="mt-1" />
                            <p className="text-xs text-gray-500 mt-1">{bot.utilization}%</p>
                          </div>
                          
                          {bot.isInUse && (
                            <p className="text-sm text-gray-600">
                              Currently used by: <span className="font-medium">{bot.currentUser}</span>
                            </p>
                          )}
                          
                          <Button
                            className="w-full"
                            onClick={() => {
                              if (bot.isInUse) {
                                joinQueue(bot.name, "Dead Rails", "Native Hub");
                              } else {
                                joinQueue(bot.name, "Dead Rails", "Native Hub");
                              }
                            }}
                            variant={bot.isInUse ? "outline" : "default"}
                            data-testid={`button-join-${bot.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                          >
                            {bot.isInUse ? (
                              <>
                                <Timer className="h-4 w-4 mr-2" />
                                Join Queue
                              </>
                            ) : (
                              <>
                                <Gamepad2 className="h-4 w-4 mr-2" />
                                Start Session
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Session History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                <p className="text-sm text-gray-600">Your recent gaming sessions and ratings</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessionHistory?.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          session.status === 'completed' ? 'bg-green-100' : 
                          session.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Bot className={`h-6 w-6 ${
                            session.status === 'completed' ? 'text-green-600' : 
                            session.status === 'in_progress' ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{session.botName}</p>
                          <p className="text-sm text-gray-600">{session.game} • {session.mode}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(session.startTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {session.rating && (
                          <div className="flex items-center space-x-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < session.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        {session.duration && (
                          <p className="text-sm font-medium">{session.duration} min</p>
                        )}
                        <Badge variant={
                          session.status === 'completed' ? 'default' : 
                          session.status === 'in_progress' ? 'secondary' : 'destructive'
                        }>
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  )) || <p className="text-gray-500 text-center py-8">No session history yet</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <p className="text-sm text-gray-600">Unlock achievements by using the platform</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements?.map((achievement) => (
                    <div
                      key={achievement.name}
                      className={`p-4 rounded-lg border-2 ${
                        achievement.unlocked 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                          <p className="font-medium">{achievement.name}</p>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          {achievement.unlocked && (
                            <Badge className="mt-1 bg-green-600">Unlocked!</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )) || <p className="text-gray-500 text-center py-8">No achievements data</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Players</CardTitle>
                <p className="text-sm text-gray-600">See how you rank against other players</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard?.map((player, index) => (
                    <div
                      key={player.username}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        player.username === username ? 'bg-primary/10 border-2 border-primary' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium flex items-center space-x-2">
                            <span>{player.username}</span>
                            {player.isVip && <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">VIP</Badge>}
                          </p>
                          <p className="text-sm text-gray-600">
                            {player.totalSessions} sessions • {Math.floor(player.totalPlayTime / 60)}h playtime
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{player.reputation}</p>
                        <p className="text-xs text-gray-500">reputation</p>
                      </div>
                    </div>
                  )) || <p className="text-gray-500 text-center py-8">No leaderboard data</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <p className="text-sm text-gray-600">Customize your profile and preferences</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <Input
                    value={profile?.displayName || ''}
                    placeholder="Enter your display name"
                    data-testid="input-display-name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <Textarea
                    value={profile?.bio || ''}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    data-testid="textarea-bio"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Games</label>
                  <div className="flex flex-wrap gap-2">
                    {profile?.favoriteGames?.map((game) => (
                      <Badge key={game} variant="secondary" className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{game}</span>
                      </Badge>
                    )) || <p className="text-gray-500 text-sm">No favorite games yet</p>}
                  </div>
                </div>
                
                <Button className="w-full" data-testid="button-save-settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}