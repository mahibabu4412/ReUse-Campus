"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, BellRing, Home, LayoutDashboard, Package, Repeat2, Handshake, Heart, History,
  Search, Plus, Settings, LogOut, Users, Flag, Layers, Mail, BarChart3,
  ExternalLink, Menu, ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

type LinkItem = { href: string; label: string; icon: LucideIcon; badge?: number };
type Section = { label: string; items: LinkItem[] };

const studentSections: Section[] = [
  { label: "Workspace", items: [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/listings", label: "My listings", icon: Package },
    { href: "/dashboard/requests", label: "My requests", icon: Repeat2 },
    { href: "/dashboard/incoming", label: "Incoming requests", icon: Handshake },
    { href: "/dashboard/saved", label: "Saved items", icon: Heart },
    { href: "/dashboard/history", label: "Exchange history", icon: History },
  ]},
  { label: "Discover", items: [
    { href: "/explore", label: "Browse marketplace", icon: Search },
    { href: "/listings/new", label: "List an item", icon: Plus },
  ]},
  { label: "Account", items: [
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile settings", icon: Settings },
  ]},
];

const adminSections: Section[] = [
  { label: "Management", items: [
    { href: "/", label: "Home", icon: Home },
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Students", icon: Users },
    { href: "/admin/listings", label: "Listings", icon: Package },
    { href: "/admin/reports", label: "Reports", icon: Flag },
    { href: "/admin/categories", label: "Categories", icon: Layers },
    { href: "/admin/messages", label: "Messages", icon: Mail },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ]},
  { label: "Account", items: [
    { href: "/", label: "View website", icon: ExternalLink },
  ]},
];

function SidebarContent({ sections, pathname }: { sections: Section[]; pathname: string }) {
  return (
    <>
      <Link href={sections === adminSections ? "/admin" : "/dashboard"} className="flex h-[72px] items-center gap-2.5 border-b border-white/10 px-5 font-bold text-white">
        <span className="grid size-8 place-items-center rounded-lg bg-primary"><img src="/images/logo.svg" alt="" className="size-5" /></span>
        <span className="leading-tight">ReUse Campus<small className="block text-[8px] tracking-[.12em] text-emerald-300">{sections === adminSections ? "ADMIN PANEL" : "STUDENT SPACE"}</small></span>
      </Link>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-emerald-200/60">{section.label}</p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = item.href === "/"
                  ? pathname === "/"
                  : item.href === (sections === adminSections ? "/admin" : "/dashboard")
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                    active ? "bg-primary text-white shadow-sm" : "text-emerald-50/80 hover:bg-white/10 hover:text-white"
                  )}>
                    <item.icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge ? <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-[10px]">{item.badge}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function AppShell({
  role, userName, title, unread = 0, pendingReports = 0, children,
}: {
  role: "student" | "admin"; userName: string; title: string;
  unread?: number; pendingReports?: number; children: React.ReactNode;
}) {
  const pathname = usePathname();
  const sections = role === "admin" ? adminSections : studentSections;
  if (role === "admin") {
    sections[0].items = sections[0].items.map((i) => i.href === "/admin/reports" ? { ...i, badge: pendingReports } : i);
  } else {
    sections[2].items = sections[2].items.map((i) => i.href === "/dashboard/notifications" ? { ...i, badge: unread } : i);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <SidebarContent sections={sections} pathname={pathname} />
        <div className="m-3 flex items-center gap-2.5 rounded-xl border-t border-white/10 p-2">
          <Avatar className="size-9"><AvatarFallback className="bg-primary text-white">{initials(userName)}</AvatarFallback></Avatar>
          <div className="min-w-0"><p className="truncate text-xs font-semibold text-white">{userName}</p><p className="text-[10px] text-emerald-300">{role === "admin" ? "Administrator" : "Student member"}</p></div>
          <Link href="/logout" className="ml-auto rounded-lg p-1.5 text-emerald-200 hover:bg-white/10" aria-label="Log out"><LogOut className="size-4" /></Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-[72px] items-center gap-3 border-b bg-card px-4 sm:px-6">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden"><Button variant="ghost" size="icon"><Menu className="size-5" /></Button></SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-full flex-col">
                <SidebarContent sections={sections} pathname={pathname} />
              </div>
            </SheetContent>
          </Sheet>
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Home">
            <Link href="/"><Home className="size-4" /></Link>
          </Button>
          <h1 className="font-semibold">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="icon" className="relative">
              <Link href={role === "admin" ? "/admin/reports" : "/dashboard/notifications"}>
                {role === "admin" ? <BellRing className="size-4" /> : <Bell className="size-4" />}
                {(role === "admin" ? pendingReports : unread) > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-card" />}
              </Link>
            </Button>
            <Avatar className="size-8"><AvatarFallback className="bg-primary/10 text-primary">{initials(userName)}</AvatarFallback></Avatar>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
