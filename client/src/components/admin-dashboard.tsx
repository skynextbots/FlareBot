import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Clock, Bot, Server, RefreshCw, Download, Eye, Link, Trash2, ArrowUp, Copy, ChevronLeft, ChevronRight, User, Key, Settings, Timer, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DashboardStats, Submission } from "@/lib/types";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const { data: dashboardData, isLoading, refetch } = useQuery<{
    stats: DashboardStats;
    submissions: Submission[];
  }>({
    queryKey: ["/api/admin/dashboard"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed!",
      description: "Dashboard data has been updated.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your data export will be ready shortly.",
    });
  };

  const handleDeleteSubmission = async (id: string) => {
    try {
      await fetch(`/api/admin/submission/${id}`, { method: 'DELETE' });
      refetch();
      toast({
        title: "Deleted!",
        description: "Submission has been removed.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the submission.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleUserClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowUserDetails(true);
  };

  const handleCloseUserDetails = () => {
    setShowUserDetails(false);
    setSelectedSubmission(null);
  };

  const handleGenerateLink = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/generate-link/${sessionId}`, { method: 'POST' });
      const { accessLink } = await response.json();
      
      await navigator.clipboard.writeText(accessLink);
      toast({
        title: "Link generated!",
        description: "Access link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Link generation failed",
        description: "An error occurred while generating the link.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-success text-white';
      case 'pending': return 'bg-orange text-white';
      case 'failed': return 'bg-error text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getKeyStatusColor = (keyStatus?: string) => {
    switch (keyStatus) {
      case 'accepted': return 'bg-success text-white';
      case 'pending': return 'bg-orange text-white';
      case 'rejected': return 'bg-error text-white';
      case 'in_use': return 'bg-secondary text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    activeUsers: 0,
    pendingVerifications: 0,
    botConfigs: 0,
    systemUptime: '0%',
  };

  const submissions = dashboardData?.submissions || [];

  return (
    <div className="relative">
      {/* User Details Slide Panel */}
      <div className={`fixed inset-y-0 left-0 z-50 w-96 bg-white border-r-2 border-orange shadow-xl transform transition-transform duration-300 ease-in-out ${
        showUserDetails ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {selectedSubmission && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-black text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 text-orange" />
                <h3 className="text-lg font-semibold">User Details</h3>
              </div>
              <Button
                variant="ghost"
                onClick={handleCloseUserDetails}
                className="text-white hover:bg-gray-800"
                data-testid="button-close-user-details"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* User Information */}
              <Card className="border-orange-light">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-black mb-4 flex items-center">
                    <User className="h-4 w-4 mr-2 text-orange" />
                    User Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Roblox Username</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 p-2 bg-gray-50 rounded border text-sm font-mono">
                          {selectedSubmission.robloxUsername}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(selectedSubmission.robloxUsername, 'Username')}
                          className="bg-orange hover:bg-orange-dark text-white"
                          data-testid="button-copy-username"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 p-2 bg-gray-50 rounded border text-sm font-mono">
                          {selectedSubmission.id}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(selectedSubmission.id, 'User ID')}
                          className="bg-orange hover:bg-orange-dark text-white"
                          data-testid="button-copy-user-id"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Details */}
              <Card className="border-orange-light">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-black mb-4 flex items-center">
                    <Check className="h-4 w-4 mr-2 text-orange" />
                    Verification Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Verification Code</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 p-2 bg-gray-50 rounded border text-sm font-mono">
                          {selectedSubmission.verificationCode}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(selectedSubmission.verificationCode, 'Verification Code')}
                          className="bg-orange hover:bg-orange-dark text-white"
                          data-testid="button-copy-verification-code"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                      <div className="mt-1">
                        <Badge className={getStatusColor(selectedSubmission.status)}>
                          {selectedSubmission.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Information */}
              {(selectedSubmission.accessKey || selectedSubmission.submittedKey) && (
                <Card className="border-orange-light">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-black mb-4 flex items-center">
                      <Key className="h-4 w-4 mr-2 text-orange" />
                      Key Information
                    </h4>
                    <div className="space-y-3">
                      {selectedSubmission.accessKey && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Access Key</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex-1 p-2 bg-gray-50 rounded border text-sm font-mono">
                              {selectedSubmission.accessKey}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard(selectedSubmission.accessKey!, 'Access Key')}
                              className="bg-orange hover:bg-orange-dark text-white"
                              data-testid="button-copy-access-key"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {selectedSubmission.submittedKey && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted Key</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex-1 p-2 bg-gray-50 rounded border text-sm font-mono">
                              {selectedSubmission.submittedKey}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard(selectedSubmission.submittedKey!, 'Submitted Key')}
                              className="bg-orange hover:bg-orange-dark text-white"
                              data-testid="button-copy-submitted-key"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {selectedSubmission.keyStatus && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Key Status</label>
                          <div className="mt-1">
                            <Badge className={getKeyStatusColor(selectedSubmission.keyStatus)}>
                              {selectedSubmission.keyStatus}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bot Configuration */}
              {(selectedSubmission.game || selectedSubmission.mode) && (
                <Card className="border-orange-light">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-black mb-4 flex items-center">
                      <Settings className="h-4 w-4 mr-2 text-orange" />
                      Bot Configuration
                    </h4>
                    <div className="space-y-3">
                      {selectedSubmission.game && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Game</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex-1 p-2 bg-gray-50 rounded border text-sm">
                              {selectedSubmission.game}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard(selectedSubmission.game!, 'Game')}
                              className="bg-orange hover:bg-orange-dark text-white"
                              data-testid="button-copy-game"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {selectedSubmission.mode && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex-1 p-2 bg-gray-50 rounded border text-sm">
                              {selectedSubmission.mode}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard(selectedSubmission.mode!, 'Mode')}
                              className="bg-orange hover:bg-orange-dark text-white"
                              data-testid="button-copy-mode"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {selectedSubmission.additionalSettings && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Additional Settings</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex-1 p-2 bg-gray-50 rounded border text-sm">
                              {selectedSubmission.additionalSettings}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard(selectedSubmission.additionalSettings!, 'Additional Settings')}
                              className="bg-orange hover:bg-orange-dark text-white"
                              data-testid="button-copy-settings"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Session Timing */}
              {(selectedSubmission.sessionStartTime || selectedSubmission.sessionEndTime) && (
                <Card className="border-orange-light">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-black mb-4 flex items-center">
                      <Timer className="h-4 w-4 mr-2 text-orange" />
                      Session Timing
                    </h4>
                    <div className="space-y-3">
                      {selectedSubmission.sessionStartTime && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Session Start</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex-1 p-2 bg-gray-50 rounded border text-sm font-mono">
                              {new Date(selectedSubmission.sessionStartTime).toLocaleString()}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard(selectedSubmission.sessionStartTime!, 'Session Start Time')}
                              className="bg-orange hover:bg-orange-dark text-white"
                              data-testid="button-copy-session-start"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {selectedSubmission.sessionEndTime && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Session End</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex-1 p-2 bg-gray-50 rounded border text-sm font-mono">
                              {new Date(selectedSubmission.sessionEndTime).toLocaleString()}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard(selectedSubmission.sessionEndTime!, 'Session End Time')}
                              className="bg-orange hover:bg-orange-dark text-white"
                              data-testid="button-copy-session-end"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${showUserDetails ? 'ml-96' : 'ml-0'}`}>
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-2 border-orange-light">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-black" data-testid="stat-active-users">
                      {stats.activeUsers}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange rounded-lg flex items-center justify-center">
                    <Users className="text-white h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm text-success mt-2 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  12% vs last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-light">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                    <p className="text-2xl font-bold text-black" data-testid="stat-pending">
                      {stats.pendingVerifications}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange rounded-lg flex items-center justify-center">
                    <Clock className="text-white h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">2.3 min avg wait time</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-light">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bot Configurations</p>
                    <p className="text-2xl font-bold text-black" data-testid="stat-bot-configs">
                      {stats.botConfigs}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <Bot className="text-orange h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm text-success mt-2 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  8% vs last week
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-light">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Uptime</p>
                    <p className="text-2xl font-bold text-black" data-testid="stat-uptime">
                      {stats.systemUptime}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center">
                    <Server className="text-white h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm text-success mt-2">30 days uptime</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Submissions Table */}
          <Card className="border-2 border-orange-light">
            <div className="px-6 py-4 border-b-2 border-orange-light bg-orange-light flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black">Recent Submissions</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="border-orange text-orange hover:bg-orange hover:text-white"
                  data-testid="button-refresh"
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="border-black text-black hover:bg-black hover:text-white"
                  data-testid="button-export"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black">
                    <TableHead className="text-xs font-medium text-orange uppercase tracking-wider">
                      User
                    </TableHead>
                    <TableHead className="text-xs font-medium text-orange uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-medium text-orange uppercase tracking-wider">
                      Game
                    </TableHead>
                    <TableHead className="text-xs font-medium text-orange uppercase tracking-wider">
                      Key Status
                    </TableHead>
                    <TableHead className="text-xs font-medium text-orange uppercase tracking-wider">
                      Timestamp
                    </TableHead>
                    <TableHead className="text-xs font-medium text-orange uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id} className="hover:bg-orange-light hover:cursor-pointer border-b border-orange-light">
                      <TableCell onClick={() => handleUserClick(submission)}>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-orange rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {submission.robloxUsername.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-black flex items-center" data-testid={`text-username-${submission.id}`}>
                              {submission.robloxUsername}
                              <ChevronRight className="h-4 w-4 ml-2 text-orange" />
                            </div>
                            <div className="text-sm text-gray-500" data-testid={`text-code-${submission.id}`}>
                              {submission.verificationCode}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(submission.status)} capitalize`}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-black">
                        {submission.game || '-'}
                      </TableCell>
                      <TableCell>
                        {submission.keyStatus ? (
                          <Badge className={`${getKeyStatusColor(submission.keyStatus)} capitalize`}>
                            {submission.keyStatus}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatTimeAgo(submission.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyToClipboard(submission.robloxUsername, 'Username')}
                            className="hover:bg-orange-light"
                            data-testid={`button-copy-username-${submission.id}`}
                            title="Copy username"
                          >
                            <Copy className="h-4 w-4 text-orange" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateLink(submission.id)}
                            className="hover:bg-orange-light"
                            data-testid={`button-link-${submission.id}`}
                            title="Generate access link for user"
                          >
                            <Link className="h-4 w-4 text-black" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubmission(submission.id)}
                            className="hover:bg-red-100"
                            data-testid={`button-delete-${submission.id}`}
                            title="Delete submission"
                          >
                            <Trash2 className="h-4 w-4 text-error" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="px-6 py-3 bg-orange-light border-t-2 border-orange flex items-center justify-between">
              <div className="text-sm text-black">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{submissions.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled
                  className="border-orange text-orange"
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-orange text-orange hover:bg-orange hover:text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>

          {/* Swipe Instructions */}
          {!showUserDetails && submissions.length > 0 && (
            <Alert className="border-orange bg-orange-light">
              <User className="h-4 w-4 text-orange" />
              <AlertDescription className="text-black">
                <p className="font-medium">💡 Pro Tip:</p>
                <p className="text-sm">Click on any username to slide out detailed user information with copy buttons for all data!</p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
