import {
  Home,
  TrendingUp,
  Building2,
  ShoppingBag,
  Share2,
  Users,
  Settings,
  LogOut,
  Wallet,
  ArrowUpDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/khalil_investment_logo.jpg";

interface AppSidebarProps {
  userRole: "admin" | "user";
  userName: string;
  userEmail: string;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export function AppSidebar({
  userRole,
  userName,
  userEmail,
  currentPath,
  onNavigate,
  onLogout,
}: AppSidebarProps) {
  const userMenuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Wallet",
      url: "/dashboard/wallet",
      icon: Wallet,
    },
    {
      title: "P2P Trading",
      url: "/dashboard/p2p",
      icon: ArrowUpDown,
    },
    {
      title: "Investments",
      url: "/dashboard/investments",
      icon: TrendingUp,
    },
    {
      title: "Real Estate",
      url: "/dashboard/real-estate",
      icon: Building2,
    },
    {
      title: "E-commerce",
      url: "/dashboard/ecommerce",
      icon: ShoppingBag,
    },
    {
      title: "Social Media",
      url: "/dashboard/social",
      icon: Share2,
    },
  ];

  const adminMenuItems = [
    {
      title: "Overview",
      url: "/admin",
      icon: Home,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Investments",
      url: "/admin/investments",
      icon: TrendingUp,
    },
    {
      title: "Real Estate",
      url: "/admin/real-estate",
      icon: Building2,
    },
    {
      title: "E-commerce",
      url: "/admin/ecommerce",
      icon: ShoppingBag,
    },
    {
      title: "Social Posts",
      url: "/admin/social",
      icon: Share2,
    },
    {
      title: "P2P Management",
      url: "/admin/p2p",
      icon: ArrowUpDown,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : userMenuItems;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <img src={logoImage} alt="Khalil Investment" className="h-8" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {userRole === "admin" ? "Admin Panel" : "My Dashboard"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.url)}
                    isActive={currentPath === item.url}
                    data-testid={`button-nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate" data-testid="text-user-name">
              {userName}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate" data-testid="text-user-email">
              {userEmail}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent"
          onClick={onLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
