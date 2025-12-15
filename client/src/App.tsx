import { useState, useEffect } from "react";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import TermsAndConditions from "@/pages/terms-and-conditions";
import UserDashboard from "@/pages/user-dashboard";
import UserInvestments from "@/pages/user-investments";
import UserRealEstate from "@/pages/user-real-estate";
import UserEcommerce from "@/pages/user-ecommerce";
import UserSocial from "@/pages/user-social";
import UserWallet from "@/pages/user-wallet";
import UserProfile from "@/pages/user-profile";
import UserReferrals from "@/pages/user-referrals";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import AdminInvestments from "@/pages/admin-investments";
import AdminRealEstate from "@/pages/admin-real-estate";
import AdminEcommerce from "@/pages/admin-ecommerce";
import AdminSocial from "@/pages/admin-social";
import AdminP2P from "@/pages/admin-p2p";
import AdminSettings from "@/pages/admin-settings";
import AdminPartners from "@/pages/admin-partners";
import AdminKyc from "@/pages/admin-kyc";
import AdminTransactions from "@/pages/admin-transactions";

type Page = 
  | "landing" 
  | "login" 
  | "register"
  | "terms"
  | "dashboard" 
  | "dashboard/investments"
  | "dashboard/real-estate"
  | "dashboard/ecommerce"
  | "dashboard/social"
  | "dashboard/wallet"
  | "dashboard/profile"
  | "dashboard/referrals"
  | "admin"
  | "admin/users"
  | "admin/investments"
  | "admin/real-estate"
  | "admin/ecommerce"
  | "admin/social"
  | "admin/p2p"
  | "admin/settings"
  | "admin/partners"
  | "admin/kyc"
  | "admin/transactions";

type UserRole = "admin" | "user" | null;

function AppContent() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [currentUser, setCurrentUser] = useState<{
    role: UserRole;
    name: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await apiRequest('GET', '/api/auth/me');
      const data = await response.json();
      
      if (data.user) {
        setCurrentUser({
          role: data.user.role === 'admin' ? 'admin' : 'user',
          name: data.user.name,
          email: data.user.email
        });
        
        if (data.user.role === 'admin') {
          setCurrentPage('admin');
        } else {
          setCurrentPage('dashboard');
        }
      }
    } catch (error) {
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      const data = await response.json();
      
      if (data.user) {
        setCurrentUser({
          role: data.user.role === 'admin' ? 'admin' : 'user',
          name: data.user.name,
          email: data.user.email
        });
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.name}!`,
        });
        
        if (data.user.role === 'admin') {
          setCurrentPage('admin');
        } else {
          setCurrentPage('dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/register', { name, email, password });
      const data = await response.json();
      
      toast({
        title: "Registration Successful",
        description: data.message || "Please check your email to verify your account.",
      });
      
      setCurrentPage('login');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      setCurrentUser(null);
      setCurrentPage('landing');
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message || "Unable to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNavigate = (path: string) => {
    const page = path.startsWith("/") ? path.slice(1) : path;
    setCurrentPage(page as Page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return (
          <Landing
            onNavigateToLogin={() => setCurrentPage("login")}
            onNavigateToRegister={() => setCurrentPage("register")}
            onNavigateToTerms={() => setCurrentPage("terms")}
          />
        );
      case "login":
        return (
          <Login
            onLogin={handleLogin}
            onNavigateToRegister={() => setCurrentPage("register")}
            onNavigateToHome={() => setCurrentPage("landing")}
            onForgotPassword={() => console.log("Forgot password")}
          />
        );
      case "register":
        return (
          <Register
            onRegister={handleRegister}
            onNavigateToLogin={() => setCurrentPage("login")}
            onNavigateToHome={() => setCurrentPage("landing")}
          />
        );
      case "terms":
        return (
          <TermsAndConditions
            onNavigateToHome={() => setCurrentPage("landing")}
          />
        );
      case "dashboard":
        return <UserDashboard />;
      case "dashboard/investments":
        return <UserInvestments />;
      case "dashboard/real-estate":
        return <UserRealEstate />;
      case "dashboard/ecommerce":
        return <UserEcommerce />;
      case "dashboard/social":
        return <UserSocial />;
      case "dashboard/wallet":
        return <UserWallet />;
      case "dashboard/profile":
        return <UserProfile />;
      case "dashboard/referrals":
        return <UserReferrals />;
      case "admin":
        return <AdminDashboard />;
      case "admin/users":
        return <AdminUsers />;
      case "admin/investments":
        return <AdminInvestments />;
      case "admin/real-estate":
        return <AdminRealEstate />;
      case "admin/ecommerce":
        return <AdminEcommerce />;
      case "admin/social":
        return <AdminSocial />;
      case "admin/p2p":
        return <AdminP2P />;
      case "admin/settings":
        return <AdminSettings />;
      case "admin/partners":
        return <AdminPartners />;
      case "admin/kyc":
        return <AdminKyc />;
      case "admin/transactions":
        return <AdminTransactions />;
      default:
        return <Landing onNavigateToLogin={() => setCurrentPage("login")} onNavigateToRegister={() => setCurrentPage("register")} onNavigateToTerms={() => setCurrentPage("terms")} />;
    }
  };

  const isDashboardPage = currentUser && (currentPage.startsWith("dashboard") || currentPage.startsWith("admin"));
  const sidebarStyle = {
    "--sidebar-width": "280px",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <>
      {isDashboardPage ? (
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar
              userRole={currentUser?.role || "user"}
              userName={currentUser?.name || ""}
              userEmail={currentUser?.email || ""}
              currentPath={`/${currentPage}`}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-4 border-b border-border">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto p-8">
                {renderPage()}
              </main>
            </div>
          </div>
        </SidebarProvider>
      ) : (
        renderPage()
      )}
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light">
          <AppContent />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
