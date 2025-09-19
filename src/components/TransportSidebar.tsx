import React from 'react';
import { CalendarCheck, Bus, ArrowLeft, Info, MapPin } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppNavigation } from '@/hooks/useAppNavigation';

interface TransportSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onBackToTransport: () => void;
}

const menuItems = [
  {
    id: 'attendance',
    title: 'Attendance',
    description: 'Mark and view attendance',
    icon: CalendarCheck,
    route: 'transport-attendance',
  },
  {
    id: 'details',
    title: 'Transport Info',
    description: 'View transport details',
    icon: MapPin,
    route: 'transport-info',
  },
];

export function TransportSidebar({ activeView, setActiveView, onBackToTransport }: TransportSidebarProps) {
  const { state } = useSidebar();
  const { navigateToPage } = useAppNavigation();
  const collapsed = state === 'collapsed';

  const handleMenuItemClick = (item: typeof menuItems[0]) => {
    setActiveView(item.id);
    navigateToPage(item.route);
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-72"} collapsible="icon">
      <SidebarContent className="p-4">
        {/* Header Section */}
        <div className="mb-6">
          {!collapsed && (
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Bus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Transport</h2>
                <p className="text-xs text-muted-foreground">Management Hub</p>
              </div>
            </div>
          )}
          
          {/* Back Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToTransport}
            className="w-full justify-start text-muted-foreground hover:text-foreground border-dashed"
          >
            <ArrowLeft className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Back to Transport</span>}
          </Button>
        </div>

        <Separator className="mb-6" />

        {/* Navigation Menu */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Quick Access
            </SidebarGroupLabel>
          )}
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleMenuItemClick(item)}
                    className={`
                      h-auto p-3 rounded-lg transition-all duration-200
                      ${activeView === item.id 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "hover:bg-muted/60 hover:shadow-sm"
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className={`
                        p-1.5 rounded-md
                        ${activeView === item.id 
                          ? "bg-primary-foreground/20" 
                          : "bg-muted"
                        }
                      `}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      {!collapsed && (
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className={`text-xs ${
                            activeView === item.id 
                              ? "text-primary-foreground/70" 
                              : "text-muted-foreground"
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}