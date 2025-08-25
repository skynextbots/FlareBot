import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface GameAccessProps {
  keySubmissionId: string;
  onReturnToDashboard: () => void;
}

export default function GameAccess({ keySubmissionId, onReturnToDashboard }: GameAccessProps) {
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

            {/* Return Button */}
            <Button
              onClick={onReturnToDashboard}
              className="w-full bg-primary hover:bg-primary-dark text-white"
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