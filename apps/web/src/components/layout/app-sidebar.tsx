'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, CalendarDays, House, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';

const items=[
  {title:'Главная',href:'/',icon:House},
  {title:'Смены',href:'/shifts',icon:CalendarDays},
];

export function AppSidebar(){
  const pathname=usePathname();
  const {state,toggleSidebar}=useSidebar();
  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-[#e2e4eb] bg-[#f2f3f8]">
      <SidebarHeader className="px-2 pt-3">
        <div className="flex h-6 items-center justify-between px-2 text-xs">
          <span className="group-data-[collapsible=icon]:hidden">CRM</span>
          <Bell className="h-3.5 w-3.5" aria-label="Уведомления" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-2">
          <SidebarMenu>
            {items.map(item=>(
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname===item.href}
                  tooltip={item.title}
                  className="h-8 text-[11px]"
                >
                  <Link href={item.href}>
                    <item.icon className="size-3.5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <button onClick={toggleSidebar} type="button" className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[11px] hover:bg-white">
          {state==='expanded'?<PanelLeftClose className="size-3.5" />:<PanelLeftOpen className="size-3.5" />}
          {state==='expanded'&&<span>Свернуть меню</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
