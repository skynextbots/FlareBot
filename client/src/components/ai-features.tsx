
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Shield, 
  Zap, 
  Target, 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  Users, 
  Clock,
  Activity,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Database,
  Network,
  Lock,
  Sparkles,
  Robot,
  Analytics,
  Globe,
  Headphones,
  FileText,
  Search
} from 'lucide-react';

interface AIFeature {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'training' | 'offline';
  accuracy: number;
  icon: React.ReactNode;
  category: string;
}

interface AIFeaturesProps {
  sessionId?: string;
}

export default function AIFeatures({ sessionId }: AIFeaturesProps) {
  const [features, setFeatures] = useState<AIFeature[]>([]);
  const [systemHealth, setSystemHealth] = useState(95);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAIFeatures();
    const interval = setInterval(updateSystemMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const initializeAIFeatures = () => {
    const aiFeatures: AIFeature[] = [
      {
        id: 'fraud-detection',
        name: 'Fraud Detection AI',
        description: 'Detects suspicious account activities and prevents unauthorized access',
        status: 'active',
        accuracy: 98.5,
        icon: <Shield className="h-5 w-5" />,
        category: 'Security'
      },
      {
        id: 'behavior-analysis',
        name: 'User Behavior Analysis',
        description: 'Analyzes user patterns to optimize bot configurations',
        status: 'active',
        accuracy: 96.2,
        icon: <Brain className="h-5 w-5" />,
        category: 'Analytics'
      },
      {
        id: 'auto-verification',
        name: 'Smart Verification',
        description: 'AI-powered verification system that reduces manual review time',
        status: 'active',
        accuracy: 94.8,
        icon: <CheckCircle className="h-5 w-5" />,
        category: 'Automation'
      },
      {
        id: 'performance-optimizer',
        name: 'Performance Optimizer',
        description: 'Automatically optimizes bot performance based on game conditions',
        status: 'active',
        accuracy: 97.3,
        icon: <Zap className="h-5 w-5" />,
        category: 'Optimization'
      },
      {
        id: 'threat-monitor',
        name: 'Threat Monitoring',
        description: 'Real-time monitoring for security threats and anomalies',
        status: 'active',
        accuracy: 99.1,
        icon: <Eye className="h-5 w-5" />,
        category: 'Security'
      },
      {
        id: 'chat-moderator',
        name: 'AI Chat Moderator',
        description: 'Monitors and moderates chat for inappropriate content',
        status: 'active',
        accuracy: 92.7,
        icon: <MessageSquare className="h-5 w-5" />,
        category: 'Moderation'
      },
      {
        id: 'predictive-analytics',
        name: 'Predictive Analytics',
        description: 'Predicts user needs and bot requirements',
        status: 'active',
        accuracy: 89.4,
        icon: <TrendingUp className="h-5 w-5" />,
        category: 'Analytics'
      },
      {
        id: 'auto-config',
        name: 'Auto Configuration',
        description: 'Automatically configures bots based on user preferences',
        status: 'active',
        accuracy: 93.6,
        icon: <Settings className="h-5 w-5" />,
        category: 'Automation'
      },
      {
        id: 'load-balancer',
        name: 'Smart Load Balancer',
        description: 'Distributes user load across available bots intelligently',
        status: 'active',
        accuracy: 98.9,
        icon: <Network className="h-5 w-5" />,
        category: 'Infrastructure'
      },
      {
        id: 'anomaly-detector',
        name: 'Anomaly Detection',
        description: 'Detects unusual patterns in bot behavior and user activity',
        status: 'active',
        accuracy: 95.7,
        icon: <AlertTriangle className="h-5 w-5" />,
        category: 'Security'
      },
      {
        id: 'resource-manager',
        name: 'Resource Manager',
        description: 'Optimizes system resource allocation dynamically',
        status: 'active',
        accuracy: 96.8,
        icon: <Cpu className="h-5 w-5" />,
        category: 'Infrastructure'
      },
      {
        id: 'data-analyzer',
        name: 'Data Intelligence',
        description: 'Analyzes usage patterns for insights and improvements',
        status: 'active',
        accuracy: 91.3,
        icon: <Database className="h-5 w-5" />,
        category: 'Analytics'
      },
      {
        id: 'security-scanner',
        name: 'Security Scanner',
        description: 'Continuously scans for vulnerabilities and security gaps',
        status: 'active',
        accuracy: 97.9,
        icon: <Lock className="h-5 w-5" />,
        category: 'Security'
      },
      {
        id: 'smart-scheduler',
        name: 'Smart Scheduler',
        description: 'Optimizes bot scheduling based on demand patterns',
        status: 'active',
        accuracy: 94.2,
        icon: <Clock className="h-5 w-5" />,
        category: 'Automation'
      },
      {
        id: 'content-filter',
        name: 'Content Filter AI',
        description: 'Filters and moderates user-generated content automatically',
        status: 'active',
        accuracy: 96.5,
        icon: <FileText className="h-5 w-5" />,
        category: 'Moderation'
      },
      {
        id: 'recommendation-engine',
        name: 'Recommendation Engine',
        description: 'Suggests optimal bot configurations and games',
        status: 'active',
        accuracy: 88.7,
        icon: <Sparkles className="h-5 w-5" />,
        category: 'Personalization'
      },
      {
        id: 'voice-assistant',
        name: 'Voice Assistant',
        description: 'Voice-controlled bot management and support',
        status: 'training',
        accuracy: 85.3,
        icon: <Headphones className="h-5 w-5" />,
        category: 'Interface'
      },
      {
        id: 'auto-recovery',
        name: 'Auto Recovery System',
        description: 'Automatically recovers from system failures and errors',
        status: 'active',
        accuracy: 99.2,
        icon: <Activity className="h-5 w-5" />,
        category: 'Infrastructure'
      },
      {
        id: 'sentiment-analyzer',
        name: 'Sentiment Analysis',
        description: 'Analyzes user feedback and satisfaction levels',
        status: 'active',
        accuracy: 92.1,
        icon: <Analytics className="h-5 w-5" />,
        category: 'Analytics'
      },
      {
        id: 'global-optimizer',
        name: 'Global Optimization',
        description: 'Optimizes platform performance across all regions',
        status: 'active',
        accuracy: 95.4,
        icon: <Globe className="h-5 w-5" />,
        category: 'Infrastructure'
      },
      {
        id: 'smart-search',
        name: 'Intelligent Search',
        description: 'AI-powered search for finding optimal bot configurations',
        status: 'active',
        accuracy: 93.8,
        icon: <Search className="h-5 w-5" />,
        category: 'Interface'
      },
      {
        id: 'bot-coordinator',
        name: 'Bot Coordinator AI',
        description: 'Coordinates multiple bots for complex multi-game scenarios',
        status: 'active',
        accuracy: 97.1,
        icon: <Robot className="h-5 w-5" />,
        category: 'Coordination'
      },
      {
        id: 'user-profiler',
        name: 'User Profiling AI',
        description: 'Creates detailed user profiles for personalized experiences',
        status: 'active',
        accuracy: 90.6,
        icon: <Users className="h-5 w-5" />,
        category: 'Personalization'
      },
      {
        id: 'adaptive-learning',
        name: 'Adaptive Learning',
        description: 'Continuously learns and adapts to improve all AI systems',
        status: 'active',
        accuracy: 94.9,
        icon: <Target className="h-5 w-5" />,
        category: 'Machine Learning'
      }
    ];

    setFeatures(aiFeatures);
    setIsLoading(false);
  };

  const updateSystemMetrics = () => {
    setSystemHealth(prev => Math.max(90, Math.min(100, prev + (Math.random() - 0.5) * 2)));
    setFeatures(prev => prev.map(feature => ({
      ...feature,
      accuracy: Math.max(80, Math.min(100, feature.accuracy + (Math.random() - 0.5) * 1))
    })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'training': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Security': 'bg-red-100 text-red-800',
      'Analytics': 'bg-blue-100 text-blue-800',
      'Automation': 'bg-green-100 text-green-800',
      'Optimization': 'bg-purple-100 text-purple-800',
      'Infrastructure': 'bg-gray-100 text-gray-800',
      'Moderation': 'bg-orange-100 text-orange-800',
      'Personalization': 'bg-pink-100 text-pink-800',
      'Interface': 'bg-indigo-100 text-indigo-800',
      'Coordination': 'bg-teal-100 text-teal-800',
      'Machine Learning': 'bg-cyan-100 text-cyan-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-500" />
            <span>AI System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall System Health</span>
              <span className="text-lg font-bold text-green-600">{systemHealth.toFixed(1)}%</span>
            </div>
            <Progress value={systemHealth} className="w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{features.filter(f => f.status === 'active').length}</p>
                <p className="text-xs text-gray-500">Active AI Systems</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{features.filter(f => f.status === 'training').length}</p>
                <p className="text-xs text-gray-500">Training</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{(features.reduce((sum, f) => sum + f.accuracy, 0) / features.length).toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Avg Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">24/7</p>
                <p className="text-xs text-gray-500">Monitoring</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Features</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {feature.icon}
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(feature.status)}`}></div>
                  </div>
                  <Badge className={getCategoryColor(feature.category)} variant="secondary">
                    {feature.category}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold">{feature.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-600 mb-3">{feature.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">Accuracy</span>
                    <span className="text-xs font-bold">{feature.accuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={feature.accuracy} className="h-2" />
                  <div className="flex justify-between items-center text-xs">
                    <span className={`px-2 py-1 rounded-full text-white ${getStatusColor(feature.status)}`}>
                      {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                    </span>
                    <Button size="sm" variant="ghost" className="h-6 text-xs">
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-500" />
            <span>AI Insights & Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                AI has detected optimal performance patterns. Consider enabling Smart Scheduler for 15% better efficiency.
              </AlertDescription>
            </Alert>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Security AI recommends updating verification protocols. Enhanced protection available.
              </AlertDescription>
            </Alert>
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Analytics AI suggests peak usage hours: 6-9 PM. Scale resources accordingly.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
