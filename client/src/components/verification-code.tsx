import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Copy, Clock, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { VerificationSession } from "@/lib/types";

interface VerificationCodeProps {
  session: VerificationSession;
  onVerified: () => void;
}

export default function VerificationCode({ session, onVerified }: VerificationCodeProps) {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const updateCountdown = () => {
      const expiresAt = new Date(session.expiresAt);
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("0:00");
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [session.expiresAt]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(session.verificationCode);
      toast({
        title: "Copied!",
        description: "Verification code copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the code manually.",
        variant: "destructive",
      });
    }
  };

  const verifyAbout = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/verify-about/${session.sessionId}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        onVerified();
        toast({
          title: "Verification complete!",
          description: "Your Roblox about section has been verified.",
        });
      } else if (response.status === 429) {
        toast({
          title: "Account locked",
          description: "Too many failed attempts. Account locked for 30 minutes.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification failed",
          description: result.error + (result.attemptsRemaining ? ` (${result.attemptsRemaining} attempts remaining)` : ''),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "An error occurred during verification.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-white h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Verified!</h3>
            <p className="text-gray-600">
              Username: <span className="font-medium" data-testid="text-verified-username">{session.robloxUsername}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Verification Code
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  value={session.verificationCode}
                  readOnly
                  className="flex-1 font-mono text-center text-lg bg-gray-50"
                  data-testid="input-verification-code"
                />
                <Button
                  onClick={copyToClipboard}
                  className="bg-secondary hover:bg-secondary-dark text-white"
                  data-testid="button-copy-code"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                <p className="font-medium mb-1">Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Copy the verification code above</li>
                  <li>Go to your <a href="https://www.roblox.com/users/profile" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Roblox Profile</a></li>
                  <li>Click "Edit Profile" and paste the code in your "About" section</li>
                  <li>Save your profile changes</li>
                  <li>Return here and click "Verify About Section" below</li>
                </ol>
                <p className="text-xs mt-2 font-medium">
                  Need help? <a href="https://en.help.roblox.com/hc/en-us/articles/203313660-All-About-Profiles-Blurbs-and-Profile-Customization" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">View Roblox Profile Help Guide</a>
                </p>
              </AlertDescription>
            </Alert>

            <Alert className="border-orange-200 bg-orange-50">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                Code expires in: <span className="font-medium" data-testid="text-time-remaining">{timeRemaining}</span>
              </AlertDescription>
            </Alert>

            <Button
              onClick={verifyAbout}
              disabled={isVerifying || timeRemaining === "0:00"}
              className="w-full bg-primary hover:bg-primary-dark text-white"
              data-testid="button-verify-about"
            >
              {isVerifying ? "Verifying About Section..." : "Verify About Section"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
