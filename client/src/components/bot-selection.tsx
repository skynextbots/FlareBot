import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Users, Clock, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import type { BotStatus } from "@/lib/types";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface BotSelectionProps {
  sessionId: string;
  onConfigured: (keySubmissionId: string) => void;
}

const formSchema = z.object({
  game: z.string().min(1, {
    message: "Please select a game.",
  }),
  mode: z.string().min(1, {
    message: "Please select a mode.",
  }),
  additionalSettings: z.string().optional(),
});

const gameOptions = [
  "Dead Rails"
];

const modeOptions = [
  "Auto Bonds"
];

export default function BotSelection({ sessionId, onConfigured }: BotSelectionProps) {
  const [botStatuses, setBotStatuses] = useState<BotStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingForAdmin, setIsWaitingForAdmin] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      game: "",
      mode: "",
      additionalSettings: "",
    },
  });

  useEffect(() => {
    fetchBotStatuses();
    const interval = setInterval(fetchBotStatuses, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchBotStatuses = async () => {
    try {
      const response = await apiRequest('/api/bot-statuses');
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
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Show loading screen immediately
    toast({
      title: "Configuration submitted!",
      description: "Processing your request...",
    });
    
    setIsWaitingForAdmin(true);
    
    try {
      // Create access request directly (skip bot config for now)
      const accessResponse = await apiRequest("POST", "/api/request-access", {
        sessionId,
        game: values.game,
        mode: values.mode,
        additionalSettings: values.additionalSettings,
      });

      if (accessResponse.ok) {
        const accessData = await accessResponse.json();

        toast({
          title: "Request submitted!",
          description: "Waiting for admin to provide access link...",
        });
        
        // Start polling for admin approval
        const pollForApproval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/key-status/${accessData.keySubmissionId}`);
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              // Check if admin has provided a link (status becomes 'link_provided')
              if (statusData.status === 'link_provided') {
                clearInterval(pollForApproval);
                setIsWaitingForAdmin(false);
                onConfigured(accessData.keySubmissionId);
              }
            } else if (statusResponse.status === 404) {
              // If submission not found, stop polling
              console.log('Submission not found, stopping polling');
              clearInterval(pollForApproval);
              setIsWaitingForAdmin(false);
            }
          } catch (error) {
            console.error('Error polling for approval:', error);
            // Stop polling on repeated errors to prevent infinite spam
            clearInterval(pollForApproval);
            setIsWaitingForAdmin(false);
          }
        }, 3000);
        
        // Clean up interval after 10 minutes
        setTimeout(() => clearInterval(pollForApproval), 600000);
      } else {
        // Even if request fails, keep showing loading until admin responds
        toast({
          title: "Request submitted!",
          description: "Waiting for admin approval...",
        });
      }
    } catch (error) {
      // Even if there's an error, show loading screen and wait for admin
      toast({
        title: "Request submitted!",
        description: "Waiting for admin approval...",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  // Show loading screen while waiting for admin
  if (isWaitingForAdmin) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Admin Approval</h2>
          <p className="text-gray-600 mb-4">Your configuration has been submitted. Please wait while the admin provides your access link.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center space-x-2 text-blue-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">This may take a few minutes...</span>
            </div>
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

              {!bot.isInUse && selectedBot === bot.botName && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="game"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Game</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a game" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {gameOptions.map((game) => (
                                  <SelectItem key={game} value={game}>
                                    {game}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The game you want to automate.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mode</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {modeOptions.map((mode) => (
                                  <SelectItem key={mode} value={mode}>
                                    {mode}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Main Support: Native Hub
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="additionalSettings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Settings</FormLabel>
                            <FormControl>
                              <Input placeholder="Optional: e.g., specific pet preferences" {...field} />
                            </FormControl>
                            <FormDescription>
                              Any other settings you want to configure.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Configuration"}
                    </Button>
                  </form>
                </Form>
              )}

              {!bot.isInUse && selectedBot !== bot.botName && (
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