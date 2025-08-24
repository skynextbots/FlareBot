import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Rocket, Bot, AlertTriangle, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BotConfiguration, BotStatus } from "@/lib/types";

const formSchema = z.object({
  game: z.string().min(1, "Please select a game"),
  mode: z.string().min(1, "Please select a mode"),
  additionalSettings: z.string().optional(),
});

interface BotConfigProps {
  sessionId: string;
  onComplete: (config: BotConfiguration) => void;
}

const games = [
  { value: "dead-rails", label: "Dead Rails" },
];

const modes = [
  { value: "native-hub", label: "Native Hub" },
];

export default function BotConfig({ sessionId, onComplete }: BotConfigProps) {
  const { toast } = useToast();
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBotStatus();
    const interval = setInterval(fetchBotStatus, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBotStatus = async () => {
    try {
      const response = await fetch('/api/bot-status/FlareBot_V1');
      if (response.ok) {
        const status = await response.json();
        setBotStatus(status);
      }
    } catch (error) {
      console.error('Failed to fetch bot status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      game: "",
      mode: "",
      additionalSettings: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (botStatus?.isInUse) {
      toast({
        title: "Bot is in use",
        description: "FlareBot_V1 is currently being used by another user. Please wait and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/bot-config", {
        sessionId,
        ...values,
      });

      const config = await response.json();
      
      // Mark configuration as complete
      await apiRequest("PUT", `/api/bot-config/${config.id}/complete`);
      
      onComplete(config);
      toast({
        title: "Configuration saved!",
        description: "Your bot has been configured successfully.",
      });
    } catch (error) {
      toast({
        title: "Configuration failed",
        description: "An error occurred while saving your configuration.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bot Status Card */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Bot className="mr-2 text-primary" />
              FlareBot_V1 Status
            </h3>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              botStatus?.isInUse 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                botStatus?.isInUse ? 'bg-red-500' : 'bg-green-500'
              }`}></div>
              <span>{botStatus?.isInUse ? 'In Use' : 'Available'}</span>
            </div>
          </div>
          
          {botStatus?.isInUse ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <p className="font-medium">Bot is currently in use</p>
                <p className="text-sm">
                  FlareBot_V1 is being used by <span className="font-medium">{botStatus.currentUser}</span>.
                  Please wait until the session ends or try again later.
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <p className="font-medium">Bot is available</p>
                <p className="text-sm">FlareBot_V1 is ready to be configured and used.</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuration Card */}
      <Card className={`shadow-md ${botStatus?.isInUse ? 'opacity-60' : ''}`}>
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Settings className="mr-3 text-primary" />
            Bot Configuration
          </h3>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="game"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Select Game
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-game">
                            <SelectValue placeholder="Choose a game..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {games.map((game) => (
                            <SelectItem key={game.value} value={game.value}>
                              {game.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Bot Mode
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-mode">
                            <SelectValue placeholder="Select mode..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {modes.map((mode) => (
                            <SelectItem key={mode.value} value={mode.value}>
                              {mode.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="additionalSettings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Submit
                    </FormLabel>
                    <FormControl>
                      <div className="p-3 bg-gray-50 rounded-md border">
                        <p className="text-sm text-gray-600">
                          Click the button below to submit your bot configuration and proceed to the next step.
                        </p>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={botStatus?.isInUse}
                className={`w-full ${
                  botStatus?.isInUse 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-dark'
                } text-white`}
                data-testid="button-configure-bot"
              >
                <Rocket className="mr-2 h-4 w-4" />
                {botStatus?.isInUse ? 'Bot In Use - Please Wait' : 'Submit Configuration'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
