import { Users, Calendar, Settings, User, QrCode, LogOut, Palette, ArrowLeft } from "lucide-react";
import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// We'll make these items dynamic based on bookingId

const settingsItems = [
  { title: "Profile", url: "/Profile", icon: User },
  { title: "Appearance", url: "/booking/appearance", icon: Palette },
];

export function BookingSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const bookingId = searchParams.get("bookingId");
  const currentPath = location.pathname;
  
  const mainItems = [
    { title: "Book Hire Students", url: `/booking/students?bookingId=${bookingId}`, icon: Users },
    { title: "Book Hire Attendance", url: `/booking/attendance?bookingId=${bookingId}`, icon: Calendar },
    { title: "Mark Attendance", url: `/booking/mark-attendance?bookingId=${bookingId}`, icon: QrCode },
  ];

  const isActive = (path: string) => currentPath === path;

  const handleLogout = () => {
    navigate("/");
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "flex items-center gap-3 rounded-lg px-3 py-2 transition-smooth";
    return isActive(path)
      ? `${baseClasses} bg-sidebar-primary text-sidebar-primary-foreground shadow-soft`
      : `${baseClasses} text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`;
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-sidebar-accent rounded-lg transition-smooth"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-5 w-5 text-sidebar-foreground" />
            </button>
            <Users className="h-8 w-8 text-sidebar-primary" />
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-sidebar-foreground">Book Hire</h2>
                <p className="text-sm text-sidebar-foreground/70">Management</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Section */}
        <div className="mt-auto p-4">
          <SidebarMenuButton onClick={handleLogout} className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}