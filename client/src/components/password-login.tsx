
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { VerificationSession } from "@/lib/types";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

interface PasswordLoginProps {
  username: string;
  onLoginSuccess: (session: VerificationSession) => void;
  onBackToVerification: () => void;
}

export default function PasswordLogin({ username, onLoginSuccess, onBackToVerification }: PasswordLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/login", {
        robloxUsername: username,
        password: values.password,
      });

      if (response.ok) {
        const data = await response.json();
        onLoginSuccess({
          sessionId: data.sessionId,
          verificationCode: data.verificationCode,
          expiresAt: data.expiresAt,
          robloxUsername: data.robloxUsername,
          isVerified: data.isVerified,
          skipVerification: data.skipVerification,
        });
        toast({
          title: "Login Successful!",
          description: "Welcome back! You've been logged in successfully.",
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      setError("An error occurred while logging in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-gray-900">
            Welcome Back, {username}!
          </CardTitle>
          <p className="text-sm text-gray-600">
            Enter your password to continue
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onBackToVerification}
                className="w-full"
              >
                New User? Start Verification
              </Button>
            </form>
          </Form>

          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
