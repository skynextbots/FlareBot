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
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingForAdmin, setIsWaitingForAdmin] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [adminApprovedLink, setAdminApprovedLink] = useState<string | null>(null);
  const { toast } = useToast();
  const [submittedKey, setSubmittedKey] = useState(""); // State for the native key input
  const [hasSubmittedKey, setHasSubmittedKey] = useState(false); // State to track if a key has been generated/submitted
  const [isCheckingStatus, setIsCheckingStatus] = useState(false); // State for checking status

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
          description: "Your access request has been sent to admin. Please wait for the access link.",
        });

        // Start polling for admin-provided link
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/key-status/${keySubmissionId}`);
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();

              if (statusData.status === 'link_provided') {
                clearInterval(pollInterval);
                // Get the admin-provided link from key submission
                const submissionResponse = await fetch(`/api/key-submission/${keySubmissionId}`);
                if (submissionResponse.ok) {
                  const submissionData = await submissionResponse.json();
                  setAdminApprovedLink(submissionData.submittedKey); // Admin stores link in submittedKey temporarily
                  setIsWaitingForAdmin(false);
                  setShowKeyInput(true);
                }
              }
            }
          } catch (error) {
            // Continue polling
          }
        }, 3000);

        // Stop polling after 15 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          if (isWaitingForAdmin) {
            setIsWaitingForAdmin(false);
            toast({
              title: "Request timeout",
              description: "Admin hasn't provided a link yet. Please try again later.",
              variant: "destructive",
            });
          }
        }, 900000);
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

  const checkKeyStatus = async () => {
    setIsCheckingStatus(true);
    // Placeholder for actual status check logic
    // For now, simulate a status check
    setTimeout(() => {
      setIsCheckingStatus(false);
      // Simulate a successful status check leading to key submission prompt
      if (keySubmissionId) {
        setHasSubmittedKey(false); // Reset or ensure it's false if re-checking
      }
    }, 2000);
  };

  const handleSubmitKey = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call to submit the native key
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network latency

      // Assuming the submission is successful
      toast({
        title: "Key Submitted Successfully",
        description: "Your native key has been processed.",
      });
      setHasSubmittedKey(true);
      onSubmitted(true); // Indicate successful submission
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your key.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isWaitingForAdmin) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Waiting for Admin Approval</h3>
              <p className="text-gray-600 mb-6">
                Your request has been submitted to the admin. Please wait for them to provide the access link.
              </p>
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show native key input interface
  if (keySubmissionId && !hasSubmittedKey) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="text-white h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Get Native Key</h3>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-800">Instructions:</p>
                <p className="text-sm text-blue-700 mt-1">
                  Click the "Get Native Key" button below to generate your access key. Then paste the key in the space provided and submit it.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              // Generate a native key
              const nativeKey = `NK_${Math.random().toString(36).substr(2, 16).toUpperCase()}`;
              setSubmittedKey(nativeKey);
              // Auto-fill the input
              const keyInput = document.getElementById('native-key-input') as HTMLInputElement;
              if (keyInput) {
                keyInput.value = nativeKey;
              }
            }}
            className="w-full bg-secondary hover:bg-secondary-dark text-white"
          >
            <Key className="mr-2 h-4 w-4" />
            Get Native Key
          </Button>

          <div className="space-y-3">
            <label htmlFor="native-key-input" className="block text-sm font-medium text-gray-700">
              Paste your key here:
            </label>
            <Input
              id="native-key-input"
              type="text"
              placeholder="Enter your native key..."
              value={submittedKey}
              onChange={(e) => setSubmittedKey(e.target.value)}
              className="font-mono text-sm"
            />

            <Button
              onClick={handleSubmitKey}
              disabled={isSubmitting || !submittedKey.trim()}
              className="w-full bg-orange hover:bg-orange-dark text-white disabled:bg-gray-300"
            >
              {isSubmitting ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Link Provided</h3>
            <p className="text-gray-600">
              The admin has provided your access link. Visit it to get your verification key.
            </p>
          </div>

          <div className="space-y-4">
            {adminApprovedLink && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Link (Provided by Admin)
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={adminApprovedLink}
                    readOnly
                    className="flex-1 bg-gray-50"
                    data-testid="input-admin-access-link"
                  />
                  <Button
                    onClick={() => window.open(adminApprovedLink, '_blank')}
                    className="bg-secondary hover:bg-secondary-dark text-white"
                    data-testid="button-open-link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click the link above to get your verification key.
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-4">
                Instructions:
              </p>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Click on the access link above to open it in a new tab</li>
                <li>Complete any required steps on that page</li>
                <li>Copy the verification key provided</li>
                <li>Return here and paste the key below</li>
              </ol>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="submittedKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paste Your Verification Key Here</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter the key from the access link"
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
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Key...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Submit Key
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {submissionStatus && (
              <Alert className={submissionStatus === "accepted" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertTriangle className={`h-4 w-4 ${submissionStatus === "accepted" ? "text-green-600" : "text-red-600"}`} />
                <AlertDescription className={submissionStatus === "accepted" ? "text-green-700" : "text-red-700"}>
                  {submissionStatus === "accepted"
                    ? "Key accepted! Waiting for admin approval to access the game."
                    : "Bot is currently being used by another user. Please try again later."
                  }
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}