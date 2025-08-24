import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Key, ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react";
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
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingForAdmin, setIsWaitingForAdmin] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [adminApprovedLink, setAdminApprovedLink] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submittedKey: "",
    },
  });

  const copyAccessKey = async () => {
    try {
      await navigator.clipboard.writeText(accessKey);
      toast({
        title: "Copied!",
        description: "Access key copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the key manually.",
        variant: "destructive",
      });
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(accessLink);
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

  // Initial request submission to admin
  const submitInitialRequest = async () => {
    setIsSubmitting(true);
    setIsWaitingForAdmin(true);
    
    try {
      const response = await apiRequest("POST", "/api/request-access", {
        sessionId
      });

      if (response.ok) {
        toast({
          title: "Request submitted!",
          description: "Your access request has been sent to admin. Please wait for approval.",
        });
        
        // Start polling for admin approval and link
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/access-request-status/${sessionId}`);
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              
              if (statusData.approved && statusData.accessLink) {
                clearInterval(pollInterval);
                setAdminApprovedLink(statusData.accessLink);
                setIsWaitingForAdmin(false);
                setShowKeyInput(true);
              }
            }
          } catch (error) {
            // Continue polling
          }
        }, 3000);
        
        // Stop polling after 10 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          if (isWaitingForAdmin) {
            setIsWaitingForAdmin(false);
            toast({
              title: "Request timeout",
              description: "Admin approval timed out. Please try again.",
              variant: "destructive",
            });
          }
        }, 600000);
      }
    } catch (error) {
      toast({
        title: "Request failed",
        description: "Failed to submit access request.",
        variant: "destructive",
      });
      setIsWaitingForAdmin(false);
    } finally {
      setIsSubmitting(false);
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
          description: "Your key has been submitted for final approval.",
        });
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

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="text-white h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Key Generated</h3>
            <p className="text-gray-600">
              Your unique access key has been generated successfully.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Link
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  value={accessLink}
                  readOnly
                  className="flex-1 font-mono text-sm bg-gray-50"
                  data-testid="input-access-link"
                />
                <Button
                  onClick={copyLink}
                  className="bg-primary hover:bg-primary-dark text-white"
                  data-testid="button-copy-link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => window.open(accessLink, '_blank')}
                  className="bg-secondary hover:bg-secondary-dark text-white"
                  data-testid="button-open-link"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Access Key
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  value={accessKey}
                  readOnly
                  className="flex-1 font-mono text-center text-lg bg-gray-50"
                  data-testid="input-access-key"
                />
                <Button
                  onClick={copyAccessKey}
                  className="bg-secondary hover:bg-secondary-dark text-white"
                  data-testid="button-copy-key"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Key className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                <p className="font-medium mb-1">Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Click the link above to access the key retrieval system</li>
                  <li>Copy your access key from the field above</li>
                  <li>Navigate to the key retrieval system using the link</li>
                  <li>Paste your key in the form below when ready</li>
                </ol>
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="submittedKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Paste Your Key Here
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Paste the access key here..."
                          className="font-mono"
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
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                  data-testid="button-submit-key"
                >
                  {isSubmitting ? "Submitting..." : "Submit Key"}
                </Button>
              </form>
            </Form>

            {submissionStatus && (
              <Alert className={`border-2 ${
                submissionStatus === 'accepted' 
                  ? 'border-green-200 bg-green-50' 
                  : submissionStatus === 'in_use'
                  ? 'border-red-200 bg-red-50'
                  : 'border-yellow-200 bg-yellow-50'
              }`}>
                {submissionStatus === 'accepted' ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      <p className="font-medium">Key Accepted!</p>
                      <p className="text-sm">Waiting for admin approval. You will be redirected automatically.</p>
                    </AlertDescription>
                  </>
                ) : submissionStatus === 'in_use' ? (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      <p className="font-medium">Bot Is Being Used Right Now</p>
                      <p className="text-sm">Please try again later when the bot becomes available.</p>
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-700">
                      <p className="font-medium">Processing...</p>
                      <p className="text-sm">Your key submission is being processed.</p>
                    </AlertDescription>
                  </>
                )}
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}