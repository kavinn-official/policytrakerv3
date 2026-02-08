import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  FileText,
  Settings,
  MessageSquare,
  Mail,
  HardDrive,
  ScanLine,
  Shield,
  ScrollText,
} from "lucide-react";

const menuItems = [
  {
    group: "Overview",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    group: "Management",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
      { title: "Support Tickets", url: "/admin/support", icon: MessageSquare },
    ],
  },
  {
    group: "Content",
    items: [
      { title: "Blog Posts", url: "/admin/blog", icon: FileText },
    ],
  },
  {
    group: "Monitoring",
    items: [
      { title: "Storage", url: "/admin/storage", icon: HardDrive },
      { title: "OCR Usage", url: "/admin/ocr", icon: ScanLine },
      { title: "Email Logs", url: "/admin/emails", icon: Mail },
    ],
  },
  {
    group: "System",
    items: [
      { title: "Settings", url: "/admin/settings", icon: Settings },
      { title: "Audit Logs", url: "/admin/audit", icon: ScrollText },
    ],
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r bg-white" collapsible="icon">
      <SidebarContent className="pt-4">
        {menuItems.map((group) => (
          <SidebarGroup key={group.group}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                {group.group}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive(item.url)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}