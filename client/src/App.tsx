import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import UserDashboard from "@/pages/user-dashboard";
import UserInvestments from "@/pages/user-investments";
import UserRealEstate from "@/pages/user-real-estate";
import UserEcommerce from "@/pages/user-ecommerce";
import UserSocial from "@/pages/user-social";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import AdminInvestments from "@/pages/admin-investments";
import AdminRealEstate from "@/pages/admin-real-estate";
import AdminEcommerce from "@/pages/admin-ecommerce";
import AdminSocial from "@/pages/admin-social";
import AdminSettings from "@/pages/admin-settings";

type Page = 
  | "landing" 
  | "login" 
  | "register" 
  | "dashboard" 
  | "dashboard/investments"
  | "dashboard/real-estate"
  | "dashboard/ecommerce"
  | "dashboard/social"
  | "admin"
  | "admin/users"
  | "admin/investments"
  | "admin/real-estate"
  | "admin/ecommerce"
  | "admin/social"
  | "admin/settings";

type UserRole = "admin" | "user" | null;

export default function App() {
  //todo: remove mock functionality - replace with real authentication
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [currentUser, setCurrentUser] = useState<{
    role: UserRole;
    name: string;
    email: string;
  } | null>(null);

  const handleLogin = (email: string, password: string) => {
    console.log("Login:", { email, password });
    //todo: remove mock functionality - check if admin credentials
    if (email === "khalilmukhtar08@gmail.com" && password === "Asdfgh08@") {
      setCurrentUser({ role: "admin", name: "Khalil Mukhtar", email });
      setCurrentPage("admin");
    } else {
      setCurrentUser({ role: "user", name: "John Doe", email });
      setCurrentPage("dashboard");
    }
  };

  const handleRegister = (name: string, email: string, password: string) => {
    console.log("Register:", { name, email, password });
    //todo: remove mock functionality - create user in database and send welcome email
    setCurrentUser({ role: "user", name, email });
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage("landing");
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
      case "admin/settings":
        return <AdminSettings />;
      default:
        return <Landing onNavigateToLogin={() => setCurrentPage("login")} onNavigateToRegister={() => setCurrentPage("register")} />;
    }
  };

  const isDashboardPage = currentUser && (currentPage.startsWith("dashboard") || currentPage.startsWith("admin"));
  const sidebarStyle = {
    "--sidebar-width": "280px",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light">
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
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
