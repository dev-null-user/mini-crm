import type { ReactNode, CSSProperties } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';

export default function ShiftsLayout({children}:{children:ReactNode}){
  return (<div>{children}</div>);
}
