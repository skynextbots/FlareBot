import { useLocation } from "wouter";
import AdminDashboard from "@/components/admin-dashboard";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Admin() {
  const [, setLocation] = useLocation();

  // Check if admin is logged in by checking for session
  const { data: isAuthenticated, isLoading } = useQuery({
    queryKey: ["/api/admin/check-auth"],
    retry: false,
  });

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem("adminSessionId");
      if (sessionId) {
        await fetch("/api/admin/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        localStorage.removeItem("adminSessionId");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLocation("/");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !localStorage.getItem("adminSessionId")) {
    setLocation("/");
    return null;
  }

  return (
    <div className="font-roboto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-black shadow-lg border-b-4 border-orange">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h2 className="text-2xl font-bold text-white">FlareBot Admin Dashboard</h2>
              <p className="text-orange">Manage user submissions and system settings</p>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:text-orange hover:bg-gray-800 border border-orange"
              data-testid="button-admin-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard />
      </div>
    </div>
  );
}
