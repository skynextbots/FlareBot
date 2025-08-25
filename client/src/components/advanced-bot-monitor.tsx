
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Server,
  Database,
  Network,
  Shield
} from 'lucide-react';

interface BotMetrics {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  uptime: number;
  cpu: number;
  memory: number;
  network: number;
  activeUsers: number;
  totalSessions: number;
  errors: number;
  responseTime: number;
  lastUpdate: Date;
  queue: number;
  maxCapacity: number;
  version: string;
  location: string;
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  botId?: string;
}

export default function AdvancedBotMonitor() {
  const [bots, setBots] = useState<BotMetrics[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBotMetrics();
    const interval = setInterval(loadBotMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadBotMetrics = () => {
    // Simulate real-time bot metrics
    const mockBots: BotMetrics[] = [
      {
        id: 'flarebot-v1',
        name: 'FlareBot V1',
        status: 'online',
        uptime: 99.7,
        cpu: Math.random() * 100,
        memory: 65 + Math.random() * 20,
        network: Math.random() * 100,
        activeUsers: Math.floor(Math.random() * 10) + 1,
        totalSessions: 1247,
        errors: 3,
        responseTime: 0.12 + Math.random() * 0.1,
        lastUpdate: new Date(),
        queue: Math.floor(Math.random() * 5),
        maxCapacity: 10,
        version: '1.2.3',
        location: 'US-East'
      },
      {
        id: 'flarebot-v2',
        name: 'FlareBot V2',
        status: 'online',
        uptime: 98.9,
        cpu: Math.random() * 100,
        memory: 45 + Math.random() * 30,
        network: Math.random() * 100,
        activeUsers: Math.floor(Math.random() * 8) + 2,
        totalSessions: 987,
        errors: 1,
        responseTime: 0.08 + Math.random() * 0.05,
        lastUpdate: new Date(),
        queue: Math.floor(Math.random() * 3),
        maxCapacity: 8,
        version: '2.1.0',
        location: 'EU-West'
      },
      {
        id: 'flarebot-premium',
        name: 'FlareBot Premium',
        status: Math.random() > 0.8 ? 'maintenance' : 'online',
        uptime: 97.5,
        cpu: Math.random() * 100,
        memory: 75 + Math.random() * 15,
        network: Math.random() * 100,
        activeUsers: Math.floor(Math.random() * 15) + 5,
        totalSessions: 2156,
        errors: 0,
        responseTime: 0.05 + Math.random() * 0.03,
        lastUpdate: new Date(),
        queue: Math.floor(Math.random() * 8),
        maxCapacity: 15,
        version: '3.0.1',
        location: 'US-West'
      }
    ];

    setBots(mockBots);
    
    // Generate alerts based on metrics
    const newAlerts: SystemAlert[] = [];
    mockBots.forEach(bot => {
      if (bot.cpu > 90) {
        newAlerts.push({
          id: `cpu-${bot.id}-${Date.now()}`,
          type: 'warning',
          message: `${bot.name}: High CPU usage (${bot.cpu.toFixed(1)}%)`,
          timestamp: new Date(),
          botId: bot.id
        });
      }
      if (bot.memory > 85) {
        newAlerts.push({
          id: `memory-${bot.id}-${Date.now()}`,
          type: 'warning',
          message: `${bot.name}: High memory usage (${bot.memory.toFixed(1)}%)`,
          timestamp: new Date(),
          botId: bot.id
        });
      }
      if (bot.status === 'error') {
        newAlerts.push({
          id: `error-${bot.id}-${Date.now()}`,
          type: 'error',
          message: `${bot.name}: Bot is experiencing errors`,
          timestamp: new Date(),
          botId: bot.id
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 10)]);
    }

    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case 'offline': return <Badge className="bg-red-100 text-red-800">Offline</Badge>;
      case 'maintenance': return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const restartBot = (botId: string) => {
    setBots(prev => prev.map(bot => 
      bot.id === botId 
        ? { ...bot, status: 'maintenance' as const }
        : bot
    ));
    
    setTimeout(() => {
      setBots(prev => prev.map(bot => 
        bot.id === botId 
          ? { ...bot, status: 'online' as const, errors: 0 }
          : bot
      ));
    }, 5000);
  };

  const selectedBotData = selectedBot ? bots.find(b => b.id === selectedBot) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Bot Monitoring</h1>
        <div className="flex space-x-2">
          <Button onClick={loadBotMetrics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      {alerts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              System Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {alerts.slice(0, 5).map((alert) => (
                <Alert key={alert.id} className={`border-l-4 ${
                  alert.type === 'error' ? 'border-l-red-500' : 
                  alert.type === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
                }`}>
                  <AlertDescription className="text-sm">
                    {alert.message}
                    <span className="text-xs text-gray-500 ml-2">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Bots</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Bot Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <Card key={bot.id} className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedBot === bot.id ? 'ring-2 ring-orange' : ''
              }`} onClick={() => setSelectedBot(bot.id)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(bot.status)}`}></div>
                      <h3 className="font-semibold">{bot.name}</h3>
                    </div>
                    {getStatusBadge(bot.status)}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span>CPU Usage</span>
                      <span className={`font-medium ${bot.cpu > 80 ? 'text-red-600' : 'text-gray-600'}`}>
                        {bot.cpu.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={bot.cpu} className="h-2" />

                    <div className="flex justify-between items-center text-sm">
                      <span>Memory</span>
                      <span className={`font-medium ${bot.memory > 80 ? 'text-red-600' : 'text-gray-600'}`}>
                        {bot.memory.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={bot.memory} className="h-2" />

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{bot.activeUsers}</div>
                        <div className="text-xs text-gray-500">Active Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{bot.queue}</div>
                        <div className="text-xs text-gray-500">In Queue</div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Uptime: {bot.uptime.toFixed(1)}%</span>
                      <span>v{bot.version}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          {selectedBotData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Detailed Bot Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedBotData.name}</span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => restartBot(selectedBotData.id)}
                        disabled={selectedBotData.status === 'maintenance'}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <div className="mt-1">
                        {getStatusBadge(selectedBotData.status)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Version</Label>
                      <div className="mt-1 text-sm">v{selectedBotData.version}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Location</Label>
                      <div className="mt-1 text-sm">{selectedBotData.location}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Capacity</Label>
                      <div className="mt-1 text-sm">
                        {selectedBotData.activeUsers}/{selectedBotData.maxCapacity}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span>Response Time</span>
                        <span className="font-medium">{selectedBotData.responseTime.toFixed(3)}s</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span>Total Sessions</span>
                        <span className="font-medium">{selectedBotData.totalSessions.toLocaleString()}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span>Errors (24h)</span>
                        <span className={`font-medium ${selectedBotData.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {selectedBotData.errors}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Cpu className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">CPU Usage</span>
                        </div>
                        <span className="text-sm font-bold">{selectedBotData.cpu.toFixed(1)}%</span>
                      </div>
                      <Progress value={selectedBotData.cpu} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <HardDrive className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Memory Usage</span>
                        </div>
                        <span className="text-sm font-bold">{selectedBotData.memory.toFixed(1)}%</span>
                      </div>
                      <Progress value={selectedBotData.memory} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Network className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Network I/O</span>
                        </div>
                        <span className="text-sm font-bold">{selectedBotData.network.toFixed(1)}%</span>
                      </div>
                      <Progress value={selectedBotData.network} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">User Load</span>
                        </div>
                        <span className="text-sm font-bold">
                          {((selectedBotData.activeUsers / selectedBotData.maxCapacity) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={(selectedBotData.activeUsers / selectedBotData.maxCapacity) * 100} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Bot</h3>
                <p className="text-gray-500">Choose a bot from the overview to see detailed metrics</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bots</p>
                    <p className="text-2xl font-bold text-blue-600">{bots.length}</p>
                  </div>
                  <Server className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2">
                  <Badge className="bg-green-100 text-green-800">
                    {bots.filter(b => b.status === 'online').length} Online
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-green-600">
                      {bots.reduce((acc, bot) => acc + bot.activeUsers, 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {(bots.reduce((acc, bot) => acc + bot.responseTime, 0) / bots.length).toFixed(3)}s
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Health</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(bots.reduce((acc, bot) => acc + bot.uptime, 0) / bots.length).toFixed(1)}%
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({ children, className = "", ...props }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium ${className}`} {...props}>{children}</label>;
}
