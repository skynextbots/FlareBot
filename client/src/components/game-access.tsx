import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";

interface GameAccessProps {
  keySubmissionId: string;
  onReturnToDashboard: () => void;
}

export default function GameAccess({ keySubmissionId, onReturnToDashboard }: GameAccessProps) {
  // Generate UUID for intent broadcast [End] when component loads
  useEffect(() => {
    const endIntentUUID = `END_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[INTENT BROADCAST - End] UUID: ${endIntentUUID} - Game access page reached for submission: ${keySubmissionId}`);
    
    // Optional: Send to backend to log the completion
    fetch('/api/log-completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keySubmissionId, endIntentUUID })
    }).catch(console.error);
  }, [keySubmissionId]);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Checkmark */}
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-white h-12 w-12" />
            </div>
            
            {/* Success Message */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Success!</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Please play the game that you have chosen. The bot will join soon. 
                It's much better for you to create a private server.
              </p>
            </div>

            {/* Return Button - Enhanced Design */}
            <Button
              onClick={onReturnToDashboard}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg border-2 border-orange-300 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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