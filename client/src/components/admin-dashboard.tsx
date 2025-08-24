import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Clock, Bot, Server, RefreshCw, Download, Eye, Link, Trash2, ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DashboardStats, Submission } from "@/lib/types";

export default function AdminDashboard() {
  const { toast } = useToast();

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
      case 'pending': return 'bg-warning text-white';
      case 'failed': return 'bg-error text-white';
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
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-active-users">
                  {stats.activeUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Users className="text-white h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-success mt-2 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              12% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-pending">
                  {stats.pendingVerifications}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center">
                <Clock className="text-white h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">2.3 min avg wait time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bot Configurations</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-bot-configs">
                  {stats.botConfigs}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <Bot className="text-white h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-success mt-2 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              8% vs last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-uptime">
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
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              data-testid="button-refresh"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
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
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Game
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mode
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {submission.robloxUsername.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900" data-testid={`text-username-${submission.id}`}>
                          {submission.robloxUsername}
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
                  <TableCell className="text-sm text-gray-900">
                    {submission.game || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">
                    {submission.mode || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatTimeAgo(submission.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" data-testid={`button-view-${submission.id}`}>
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGenerateLink(submission.id)}
                        data-testid={`button-link-${submission.id}`}
                        title="Generate access link for user"
                      >
                        <Link className="h-4 w-4 text-secondary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubmission(submission.id)}
                        data-testid={`button-delete-${submission.id}`}
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

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{submissions.length}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
