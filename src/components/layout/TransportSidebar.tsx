import React from 'react';
import { Calendar, Truck } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
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

const transportItems = [
  { title: 'Attendance', url: '/transport/:transportId/attendance', icon: Calendar },
];

interface TransportSidebarProps {
  transportId?: string;
}

export function TransportSidebar({ transportId }: TransportSidebarProps) {
  const { open } = useSidebar();
  const location = useLocation();

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-muted text-primary font-medium' : 'hover:bg-muted/50';

  return (
    <Sidebar collapsible="icon" className={open ? 'w-60' : 'w-14'}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Truck className="h-4 w-4 mr-2" />
            {open && 'Transport'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {transportItems.map((item) => {
                const url = transportId
                  ? item.url.replace(':transportId', transportId)
                  : item.url;
                const isActive = location.pathname.includes('/attendance');

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={url} className={getNavCls({ isActive })}>
                        <item.icon className="h-4 w-4" />
                        {open && <span className="ml-2">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
