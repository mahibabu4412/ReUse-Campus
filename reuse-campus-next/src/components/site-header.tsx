"use client";

import Link from "next/link";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LayoutDashboard, LogOut, Menu, Package, Plus, Settings, Heart, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/actions/auth";
import { initials, imageUrl } from "@/lib/format";

export type HeaderUser = {
  name: string;
  email: string;
  role: "student" | "admin";
  image?: string | null;
};

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ user, unread = 0 }: { user: HeaderUser | null; unread?: number }) {
  const pathname = usePathname();
  const dashboard = user?.role === "admin" ? "/admin" : "/dashboard";
  const logoutForm = useRef<HTMLFormElement>(null);

  return (
    <>
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetTitle className="mb-6">ReUse Campus</SheetTitle>
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm hover:bg-accent">
                  {l.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <img src="/images/logo.svg" alt="" className="size-5" />
          </span>
          <span className="leading-tight">ReUse Campus<small className="block text-[9px] font-semibold tracking-[.12em] text-primary">SHARE · REUSE · LEARN</small></span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href} href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                (l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)) ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >{l.label}</Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Button asChild variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Link href={user.role === "admin" ? "/admin/reports" : "/dashboard/notifications"}>
                  <Bell className="size-4" />
                  {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-background" />}
                </Link>
              </Button>
              {user.role === "student" && (
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/listings/new"><Plus className="size-4" /> List an item</Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="size-8"><AvatarImage src={imageUrl(user.image)} alt="" /><AvatarFallback>{initials(user.name)}</AvatarFallback></Avatar>
                    <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                    <ChevronDown className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Signed in as {user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href={dashboard}><LayoutDashboard className="mr-2 size-4" /> Dashboard</Link></DropdownMenuItem>
                  {user.role === "student" ? (
                    <>
                      <DropdownMenuItem asChild><Link href="/dashboard/listings"><Package className="mr-2 size-4" /> My listings</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/dashboard/requests"><Repeat2 className="mr-2 size-4" /> Requests</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/dashboard/saved"><Heart className="mr-2 size-4" /> Saved items</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/profile"><Settings className="mr-2 size-4" /> Profile settings</Link></DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild><Link href="/admin"><LayoutDashboard className="mr-2 size-4" /> Admin panel</Link></DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logoutForm.current?.requestSubmit()}>
                    <LogOut className="mr-2 size-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link href="/login">Log in</Link></Button>
              <Button asChild size="sm"><Link href="/register"><Plus className="size-4" /> Sign up</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
    {/* Kept outside the menu: a form wrapper inside the Base UI popup breaks it. */}
    <form ref={logoutForm} action={logoutAction} className="hidden" />
    </>
  );
}
