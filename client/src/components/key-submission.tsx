import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Copy, Key, Loader2, Shield, AlertTriangle, ExternalLink, Info, RefreshCw, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  submittedKey: z.string().min(1, "Please enter the access key"),
});

interface KeySubmissionProps {
  sessionId: string;
  accessLink: string;
  accessKey: string;
  keySubmissionId: string;
  onSubmitted: (approved: boolean) => void;
}

export default function KeySubmission({
  sessionId,
  accessLink,
  accessKey,
  keySubmissionId,
  onSubmitted
}: KeySubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedKey, setHasSubmittedKey] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submittedKey: "",
    },
  });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://getnative.cc/linkvertise");
      toast({
        title: "Link copied!",
        description: "Access link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/submit-key", {
        sessionId,
        submittedKey: values.submittedKey,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Key submitted!",
          description: "Your key has been submitted for approval.",
        });
        setHasSubmittedKey(true);
        onSubmitted(true);
      } else {
        toast({
          title: "Invalid key",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "An error occurred while submitting the key.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmittedKey) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Key Submitted Successfully</h3>
              <p className="text-gray-600">
                Your verification key has been submitted and is being processed by the admin.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Step 1: Message with link */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Your Access Key</h3>
              <p className="text-gray-700 mb-4">Click the link below to continue:</p>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">👉</span>
                  <Button
                    onClick={() => window.open('https://getnative.cc/linkvertise', '_blank')}
                    className="bg-primary hover:bg-primary-dark text-white"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    getnative.cc/linkvertise
                  </Button>
                  <Button
                    onClick={copyLink}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 2: Instructions + Warning */}
            <div className="space-y-3">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-700">
                  <div className="space-y-2">
                    <p>⚠️ This link contains many advertisements.</p>
                    <p>⚠️ You may be asked to complete activities to prove you are not a bot.</p>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-800 mb-2">Instructions:</p>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Click the link above to open it in a new tab</li>
                      <li>Complete any required steps on that page</li>
                      <li>After completing the tasks on that website, you will receive a key (verification code)</li>
                      <li>Copy the verification key provided</li>
                      <li>Return here and paste the key below</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 & 4: Textbox and Submit button */}
            <div className="border-t pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="submittedKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Paste your key here</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter the key from the verification page"
                            className="font-mono text-sm h-12"
                            data-testid="input-submitted-key"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-dark text-white h-12"
                    data-testid="button-submit-key"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Key...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}