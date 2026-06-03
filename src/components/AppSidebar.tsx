import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Mail, FileText, ListTodo, Search, MessageSquare, Sparkles, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const tools = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Notes Summarizer", url: "/summarize", icon: FileText },
  { title: "Task Planner", url: "/planner", icon: ListTodo },
  { title: "Research Assistant", url: "/research", icon: Search },
  { title: "AI Chat", url: "/chat", icon: MessageSquare },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const collapsed = state === "collapsed";

  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-2">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold tracking-tight truncate">Workmate AI</span>
              <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Productivity Suite</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((t) => (
                <SidebarMenuItem key={t.url}>
                  <SidebarMenuButton asChild isActive={isActive(t.url)} tooltip={t.title}>
                    <Link to={t.url}>
                      <t.icon className="h-4 w-4" />
                      <span>{t.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <Button variant="ghost" size="sm" onClick={logout} className="justify-start gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}