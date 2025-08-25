import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Home, 
  User, 
  Settings, 
  HelpCircle, 
  Shield, 
  BarChart3, 
  Bot, 
  Users, 
  GamepadIcon, 
  Trophy, 
  Star, 
  Clock, 
  Zap, 
  Bell,
  ChevronRight
} from "lucide-react";

interface CategoriesSidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export default function CategoriesSidebar({ currentPage = "dashboard", onNavigate }: CategoriesSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    { id: "dashboard", icon: Home, label: "Dashboard", badge: null, color: "text-orange-600" },
    { id: "profile", icon: User, label: "User Profile", badge: null, color: "text-blue-600" },
    { id: "bots", icon: Bot, label: "Bot Management", badge: "3", color: "text-green-600" },
    { id: "games", icon: GamepadIcon, label: "Game Library", badge: "NEW", color: "text-purple-600" },
    { id: "leaderboard", icon: Trophy, label: "Leaderboard", badge: null, color: "text-yellow-600" },
    { id: "achievements", icon: Star, label: "Achievements", badge: "5", color: "text-pink-600" },
    { id: "history", icon: Clock, label: "Session History", badge: null, color: "text-gray-600" },
    { id: "performance", icon: BarChart3, label: "Performance", badge: null, color: "text-indigo-600" },
    { id: "notifications", icon: Bell, label: "Notifications", badge: "12", color: "text-red-600" },
    { id: "premium", icon: Zap, label: "Premium Features", badge: "PRO", color: "text-orange-500" },
    { id: "community", icon: Users, label: "Community", badge: null, color: "text-cyan-600" },
    { id: "support", icon: HelpCircle, label: "Help & Support", badge: null, color: "text-green-500" },
    { id: "security", icon: Shield, label: "Security", badge: null, color: "text-red-500" },
    { id: "settings", icon: Settings, label: "Settings", badge: null, color: "text-gray-500" },
  ];

  const handleCategoryClick = (categoryId: string) => {
    if (onNavigate) {
      onNavigate(categoryId);
    }
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="fixed top-4 left-4 z-50 h-12 w-12 rounded-lg bg-white/80 backdrop-blur-sm border-2 border-orange-200 shadow-lg hover:shadow-xl hover:bg-orange-50 transition-all duration-200 hover:scale-105"
          data-testid="button-categories-menu"
        >
          <Menu className="h-6 w-6 text-orange-600" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-80 p-0 bg-gradient-to-b from-white to-gray-50 border-l-4 border-orange-500 shadow-2xl"
      >
        <SheetHeader className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
          <SheetTitle className="text-xl font-bold flex items-center">
            <Bot className="mr-3 h-6 w-6" />
            FlareBot Categories
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-auto p-4 space-y-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = currentPage === category.id;
            
            return (
              <Button
                key={category.id}
                variant="ghost"
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full justify-start p-4 h-auto rounded-xl border-2 transition-all duration-200 hover:scale-102 shadow-sm hover:shadow-md ${
                  isActive 
                    ? 'bg-orange-100 border-orange-300 text-orange-800 shadow-lg' 
                    : 'border-transparent hover:bg-gray-100 hover:border-gray-200'
                }`}
                data-testid={`button-category-${category.id}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-orange-600' : category.color}`} />
                    <span className={`font-medium ${isActive ? 'text-orange-800' : 'text-gray-700'}`}>
                      {category.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {category.badge && (
                      <Badge 
                        variant={category.badge === "NEW" || category.badge === "PRO" ? "destructive" : "default"}
                        className={`text-xs px-2 py-1 ${
                          category.badge === "NEW" ? "bg-green-500 text-white" :
                          category.badge === "PRO" ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white" :
                          "bg-orange-500 text-white"
                        }`}
                      >
                        {category.badge}
                      </Badge>
                    )}
                    <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90 text-orange-600' : 'text-gray-400'}`} />
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
        
        <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-t-2 border-orange-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">FlareBot v2.0</p>
            <p className="text-xs text-gray-500">Experience the power of automation</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}