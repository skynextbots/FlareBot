
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Zap, 
  Users, 
  MessageCircle, 
  Shield, 
  Search, 
  BarChart3, 
  Cpu, 
  Wifi, 
  Database 
} from 'lucide-react';

interface WebsiteAISystem {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'optimizing' | 'maintenance';
  performance: number;
  icon: React.ReactNode;
  metrics: {
    requests: number;
    responseTime: number;
    accuracy: number;
  };
}

export default function WebsiteAISystems() {
  const [aiSystems, setAISystems] = useState<WebsiteAISystem[]>([]);
  const [overallPerformance, setOverallPerformance] = useState(96.8);

  useEffect(() => {
    initializeWebsiteAI();
    const interval = setInterval(updateMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  const initializeWebsiteAI = () => {
    const systems: WebsiteAISystem[] = [
      {
        id: 'web-optimizer',
        name: 'Website Performance AI',
        description: 'Optimizes page load times, caching, and resource delivery',
        status: 'online',
        performance: 98.5,
        icon: <Zap className="h-5 w-5 text-yellow-500" />,
        metrics: { requests: 15420, responseTime: 0.12, accuracy: 99.2 }
      },
      {
        id: 'cdn-manager',
        name: 'Smart CDN Manager',
        description: 'Intelligently manages content delivery across global networks',
        status: 'online',
        performance: 97.3,
        icon: <Globe className="h-5 w-5 text-blue-500" />,
        metrics: { requests: 8932, responseTime: 0.08, accuracy: 98.7 }
      },
      {
        id: 'user-experience',
        name: 'UX Analytics AI',
        description: 'Analyzes user behavior to improve website experience',
        status: 'online',
        performance: 95.7,
        icon: <Users className="h-5 w-5 text-green-500" />,
        metrics: { requests: 12847, responseTime: 0.15, accuracy: 96.4 }
      },
      {
        id: 'chatbot-engine',
        name: 'Intelligent Chatbot',
        description: 'AI-powered customer support and user assistance',
        status: 'online',
        performance: 94.2,
        icon: <MessageCircle className="h-5 w-5 text-purple-500" />,
        metrics: { requests: 3421, responseTime: 0.23, accuracy: 94.8 }
      },
      {
        id: 'security-firewall',
        name: 'AI Security Firewall',
        description: 'Advanced threat detection and DDoS protection',
        status: 'online',
        performance: 99.1,
        icon: <Shield className="h-5 w-5 text-red-500" />,
        metrics: { requests: 45230, responseTime: 0.05, accuracy: 99.6 }
      },
      {
        id: 'search-optimizer',
        name: 'Search Enhancement AI',
        description: 'Improves SEO and search functionality across the platform',
        status: 'online',
        performance: 93.6,
        icon: <Search className="h-5 w-5 text-orange-500" />,
        metrics: { requests: 7854, responseTime: 0.18, accuracy: 95.1 }
      },
      {
        id: 'analytics-engine',
        name: 'Real-time Analytics AI',
        description: 'Processes and analyzes website traffic and user data',
        status: 'online',
        performance: 96.9,
        icon: <BarChart3 className="h-5 w-5 text-indigo-500" />,
        metrics: { requests: 25631, responseTime: 0.11, accuracy: 97.8 }
      },
      {
        id: 'resource-balancer',
        name: 'Resource Load Balancer',
        description: 'Distributes server load and optimizes resource allocation',
        status: 'online',
        performance: 98.2,
        icon: <Cpu className="h-5 w-5 text-cyan-500" />,
        metrics: { requests: 18942, responseTime: 0.09, accuracy: 98.9 }
      },
      {
        id: 'network-optimizer',
        name: 'Network Optimization AI',
        description: 'Optimizes network routes and connection quality',
        status: 'online',
        performance: 97.1,
        icon: <Wifi className="h-5 w-5 text-teal-500" />,
        metrics: { requests: 11205, responseTime: 0.07, accuracy: 97.5 }
      },
      {
        id: 'database-optimizer',
        name: 'Database Intelligence',
        description: 'Optimizes database queries and manages data efficiently',
        status: 'online',
        performance: 95.4,
        icon: <Database className="h-5 w-5 text-pink-500" />,
        metrics: { requests: 32156, responseTime: 0.14, accuracy: 96.2 }
      }
    ];

    setAISystems(systems);
  };

  const updateMetrics = () => {
    setAISystems(prev => prev.map(system => ({
      ...system,
      performance: Math.max(90, Math.min(100, system.performance + (Math.random() - 0.5) * 2)),
      metrics: {
        ...system.metrics,
        requests: system.metrics.requests + Math.floor(Math.random() * 50),
        responseTime: Math.max(0.05, system.metrics.responseTime + (Math.random() - 0.5) * 0.02),
        accuracy: Math.max(90, Math.min(100, system.metrics.accuracy + (Math.random() - 0.5) * 1))
      }
    })));

    setOverallPerformance(prev => Math.max(90, Math.min(100, prev + (Math.random() - 0.5) * 1)));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'optimizing': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Website AI Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-blue-600" />
            <span>Website AI Systems Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{overallPerformance.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Overall Performance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{aiSystems.filter(s => s.status === 'online').length}</div>
              <div className="text-sm text-gray-600">Systems Online</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {aiSystems.reduce((sum, s) => sum + s.metrics.requests, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {(aiSystems.reduce((sum, s) => sum + s.metrics.responseTime, 0) / aiSystems.length).toFixed(2)}s
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Systems Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {aiSystems.map((system) => (
          <Card key={system.id} className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {system.icon}
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(system.status)}`}></div>
                </div>
                <Badge variant="secondary" className="bg-gray-100">
                  {system.status.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-lg">{system.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{system.description}</p>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Performance</span>
                    <span className="font-bold">{system.performance.toFixed(1)}%</span>
                  </div>
                  <Progress value={system.performance} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{system.metrics.requests.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Requests</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{system.metrics.responseTime.toFixed(2)}s</div>
                    <div className="text-xs text-gray-500">Response</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">{system.metrics.accuracy.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">Accuracy</div>
                  </div>
                </div>

                <Button size="sm" className="w-full mt-3" variant="outline">
                  Configure System
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
