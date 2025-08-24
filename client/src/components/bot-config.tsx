import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Rocket } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BotConfiguration } from "@/lib/types";

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      game: "",
      mode: "",
      additionalSettings: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
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
                className="w-full bg-primary hover:bg-primary-dark text-white"
                data-testid="button-configure-bot"
              >
                <Rocket className="mr-2 h-4 w-4" />
                Submit Configuration
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
