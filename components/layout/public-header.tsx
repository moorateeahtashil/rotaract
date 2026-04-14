"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@/lib/db/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { RotaractLogo } from "./rotary-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Enhanced navigation following Rotary Quick Start Guide structure
const MAIN_NAV = [
  { label: "Home", href: "/" },
  { 
    label: "About", 
    href: "/about",
    children: [
      { label: "About Rotaract", href: "/about" },
      { label: "About Rotary", href: "/about/rotary" },
      { label: "Our Club", href: "/about/our-club" },
      { label: "Leadership", href: "/leadership" },
    ]
  },
  { label: "Members", href: "/members" },
  { 
    label: "Service", 
    href: "/projects",
    children: [
      { label: "Projects", href: "/projects" },
      { label: "Events", href: "/events" },
      { label: "Avenues of Service", href: "/avenues-of-service" },
    ]
  },
  { label: "News", href: "/news" },
  { label: "Gallery", href: "/gallery" },
  { label: "FAQ", href: "/faq" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Rotary Masterbrand */}
          <RotaractLogo clubName="Rotaract Club" className="flex-shrink-0" />

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {MAIN_NAV.map((item) => (
              <div key={item.href} className="relative">
                {item.children ? (
                  <div
                    onMouseEnter={() => {
                      if (item.href === "/about") setAboutOpen(true);
                      if (item.href === "/projects") setServiceOpen(true);
                    }}
                    onMouseLeave={() => {
                      if (item.href === "/about") setAboutOpen(false);
                      if (item.href === "/projects") setServiceOpen(false);
                    }}
                    className="relative"
                  >
                    <button
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                        pathname === item.href || pathname.startsWith(item.href + "/")
                          ? "text-rotary-blue bg-rotary-blue/5"
                          : "text-charcoal hover:text-rotary-blue hover:bg-rotary-blue/5"
                      )}
                    >
                      {item.label}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    
                    {/* Dropdown with invisible bridge */}
                    {((item.href === "/about" && aboutOpen) || (item.href === "/projects" && serviceOpen)) && (
                      <>
                        {/* Invisible bridge to prevent dropdown from closing */}
                        <div className="absolute top-full left-0 h-2 w-full" />
                        <div className="absolute top-full left-0 mt-0 w-48 bg-white rounded-md shadow-lg border border-border py-1 z-50">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "block px-4 py-2 text-sm transition-colors",
                                pathname === child.href || pathname.startsWith(child.href + "/")
                                  ? "text-rotary-blue bg-rotary-blue/5"
                                  : "text-charcoal hover:text-rotary-blue hover:bg-rotary-blue/5"
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href || pathname.startsWith(item.href + "/")
                        ? "text-rotary-blue bg-rotary-blue/5"
                        : "text-charcoal hover:text-rotary-blue hover:bg-rotary-blue/5"
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="bg-rotary-gold text-black hover:bg-rotary-gold/90">
              <Link href="/join">Join Us</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-md text-charcoal hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <nav className="mx-auto max-w-7xl px-4 py-3 space-y-1">
            {MAIN_NAV.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "text-rotary-blue bg-rotary-blue/5"
                      : "text-charcoal hover:text-rotary-blue hover:bg-rotary-blue/5"
                  )}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 rounded-md text-sm text-pewter hover:text-rotary-blue hover:bg-rotary-blue/5"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="bg-rotary-gold text-black hover:bg-rotary-gold/90">
                <Link href="/join">Join Us</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
