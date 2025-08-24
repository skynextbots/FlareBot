import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GamepadIcon, Timer, Activity } from "lucide-react";

interface GameAccessProps {
  keySubmissionId: string;
  onReturnToDashboard: () => void;
}

export default function GameAccess({ keySubmissionId, onReturnToDashboard }: GameAccessProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("10:00");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const endTime = Date.now() + (10 * 60 * 1000); // 10 minutes from now
    
    const updateCountdown = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeRemaining("0:00");
        setIsActive(false);
        // Trigger the next intent here (UUID will be provided later)
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReturnToDashboard = () => {
    onReturnToDashboard();
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <GamepadIcon className="text-white h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">You May Now Play!</h3>
            <p className="text-gray-600 mb-4">
              You may now play the game you have chosen. The bot is ready and active.
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Timer className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold text-gray-900">Session Time</span>
              </div>
              <div className="text-3xl font-bold text-primary" data-testid="text-time-remaining">
                {timeRemaining}
              </div>
              <p className="text-sm text-gray-500 mt-1">Time remaining in current session</p>
            </div>

            <Alert className="border-green-200 bg-green-50">
              <Activity className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <p className="font-medium mb-1">Supported Operations:</p>
                <div className="bg-white p-2 rounded border">
                  <Input
                    value="Auto Bonds"
                    readOnly
                    className="text-center font-medium bg-transparent border-none text-green-700"
                    data-testid="input-supported-operations"
                  />
                </div>
              </AlertDescription>
            </Alert>

            {!isActive && (
              <Alert className="border-red-200 bg-red-50">
                <Timer className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <p className="font-medium">Session Expired</p>
                  <p className="text-sm">Your gaming session has ended. Return to dashboard to start a new session.</p>
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleReturnToDashboard}
              className={`w-full ${
                isActive 
                  ? 'bg-primary hover:bg-primary-dark' 
                  : 'bg-secondary hover:bg-secondary-dark'
              } text-white`}
              data-testid="button-return-dashboard"
            >
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}