import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import type { BotStatus } from "@/lib/types";

interface BotSelectionProps {
  onBotSelected: (botName: string) => void;
}

export default function BotSelection({ onBotSelected }: BotSelectionProps) {
  const [botStatuses, setBotStatuses] = useState<BotStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);

  useEffect(() => {
    fetchBotStatuses();
    const interval = setInterval(fetchBotStatuses, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchBotStatuses = async () => {
    try {
      const response = await fetch('/api/bot-statuses');
      if (response.ok) {
        const statuses = await response.json();
        setBotStatuses(statuses);
      }
    } catch (error) {
      console.error('Failed to fetch bot statuses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBotSelect = (botName: string) => {
    setSelectedBot(botName);
    onBotSelected(botName);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Bot</h2>
        <p className="text-gray-600">Choose an available bot to configure and use</p>
      </div>

      <div className="grid gap-4">
        {botStatuses.map((bot) => (
          <Card
            key={bot.botName}
            className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
              bot.isInUse
                ? 'border-red-200 bg-red-50'
                : 'border-green-200 hover:border-primary'
            }`}
            onClick={() => !bot.isInUse && handleBotSelect(bot.botName)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    bot.isInUse ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    <Bot className={`h-6 w-6 ${bot.isInUse ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{bot.botName}</h3>
                    <p className="text-sm text-gray-500">Roblox Automation Bot</p>
                  </div>
                </div>

                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  bot.isInUse
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    bot.isInUse ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <span>{bot.isInUse ? 'In Use' : 'Available'}</span>
                </div>
              </div>

              {bot.isInUse ? (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Currently in use by {bot.currentUser}</p>
                        <p className="text-xs">
                          Session ends: {bot.sessionEndTime ? new Date(bot.sessionEndTime).toLocaleTimeString() : 'Unknown'}
                        </p>
                      </div>
                      <Users className="h-4 w-4" />
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Ready to configure</p>
                        <p className="text-xs">Click to select this bot</p>
                      </div>
                      <Clock className="h-4 w-4" />
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {!bot.isInUse && (
                <Button
                  className="w-full mt-4 bg-primary hover:bg-primary-dark text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBotSelect(bot.botName);
                  }}
                >
                  Select {bot.botName}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}