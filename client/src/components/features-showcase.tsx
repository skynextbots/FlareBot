
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, Shield, Users, Clock, Settings, Database, 
  Activity, Lock, Bell, BarChart, FileText, 
  RefreshCw, Zap, Target, Globe, Code, 
  Smartphone, Headphones, Award, Star,
  Calendar, MessageCircle, CheckCircle2, AlertTriangle
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Multi-Bot Support",
    description: "Support for multiple specialized Roblox bots",
    category: "Core",
    status: "Active"
  },
  {
    icon: Shield,
    title: "Advanced Verification",
    description: "Profile About section verification with retry limits",
    category: "Security",
    status: "Active"
  },
  {
    icon: Users,
    title: "User Management",
    description: "Comprehensive user tracking and session management",
    category: "Management",
    status: "Active"
  },
  {
    icon: Clock,
    title: "Session Timers",
    description: "10-minute gaming sessions with automatic expiration",
    category: "Core",
    status: "Active"
  },
  {
    icon: Settings,
    title: "Dynamic Configuration",
    description: "Real-time bot configuration and settings adjustment",
    category: "Configuration",
    status: "Active"
  },
  {
    icon: Database,
    title: "Data Persistence",
    description: "Secure data storage with backup and recovery",
    category: "Storage",
    status: "Active"
  },
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description: "Live bot status and performance monitoring",
    category: "Monitoring",
    status: "Active"
  },
  {
    icon: Lock,
    title: "Account Locking",
    description: "Temporary account locks after failed attempts",
    category: "Security",
    status: "Active"
  },
  {
    icon: Bell,
    title: "Admin Notifications",
    description: "Real-time notifications for admin actions",
    category: "Communication",
    status: "New"
  },
  {
    icon: BarChart,
    title: "Usage Analytics",
    description: "Detailed analytics and usage statistics",
    category: "Analytics",
    status: "New"
  },
  {
    icon: FileText,
    title: "Audit Logging",
    description: "Complete audit trail of all system activities",
    category: "Security",
    status: "New"
  },
  {
    icon: RefreshCw,
    title: "Auto-Recovery",
    description: "Automatic system recovery and error handling",
    category: "Reliability",
    status: "New"
  },
  {
    icon: Zap,
    title: "Performance Optimization",
    description: "Optimized API calls and caching mechanisms",
    category: "Performance",
    status: "Active"
  },
  {
    icon: Target,
    title: "Game-Specific Modes",
    description: "Specialized configurations for different games",
    category: "Gaming",
    status: "Active"
  },
  {
    icon: Globe,
    title: "Multi-Region Support",
    description: "Support for multiple Roblox regions and servers",
    category: "Global",
    status: "New"
  },
  {
    icon: Code,
    title: "API Integration",
    description: "RESTful API for third-party integrations",
    category: "Integration",
    status: "Active"
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description: "Fully responsive design for mobile devices",
    category: "UI/UX",
    status: "Active"
  },
  {
    icon: Headphones,
    title: "24/7 Support System",
    description: "Integrated support ticket and help system",
    category: "Support",
    status: "New"
  },
  {
    icon: Award,
    title: "Achievement System",
    description: "User achievements and milestone tracking",
    category: "Gamification",
    status: "New"
  },
  {
    icon: Star,
    title: "Rating System",
    description: "User rating and feedback system for bots",
    category: "Feedback",
    status: "New"
  },
  {
    icon: Calendar,
    title: "Scheduling System",
    description: "Schedule bot sessions for specific times",
    category: "Scheduling",
    status: "New"
  },
  {
    icon: MessageCircle,
    title: "In-App Messaging",
    description: "Direct messaging between users and admins",
    category: "Communication",
    status: "New"
  },
  {
    icon: CheckCircle2,
    title: "Queue Management",
    description: "Advanced queue system for bot access",
    category: "Management",
    status: "New"
  },
  {
    icon: AlertTriangle,
    title: "Advanced Security",
    description: "Multi-layer security with fraud detection",
    category: "Security",
    status: "New"
  }
];

export default function FeaturesShowcase() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "New": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Core": "bg-purple-100 text-purple-800",
      "Security": "bg-red-100 text-red-800",
      "Management": "bg-orange-100 text-orange-800",
      "Configuration": "bg-yellow-100 text-yellow-800",
      "Storage": "bg-indigo-100 text-indigo-800",
      "Monitoring": "bg-green-100 text-green-800",
      "Communication": "bg-blue-100 text-blue-800",
      "Analytics": "bg-teal-100 text-teal-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Platform Features</h2>
        <p className="text-gray-600">Comprehensive features for bot management and user experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {feature.title}
                    </h3>
                    <Badge className={`text-xs ${getStatusColor(feature.status)}`}>
                      {feature.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{feature.description}</p>
                  <Badge variant="outline" className={`text-xs ${getCategoryColor(feature.category)}`}>
                    {feature.category}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
