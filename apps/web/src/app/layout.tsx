import type { ReactNode, CSSProperties } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini CRM",
  description: "Система управлением графиком смен в рамках тестового задания",
};

export default function RootLayout({children}:{children:ReactNode}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <SidebarProvider style={{'--sidebar-width':'10.4rem','--sidebar-width-icon':'3.5rem'} as CSSProperties}>
            <AppSidebar />
            <SidebarInset className="min-w-0 bg-[#f2f3f8]">
                {children}
            </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
};