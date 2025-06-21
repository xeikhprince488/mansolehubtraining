"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Topbar = () => {
  const { isSignedIn } = useAuth();
  const pathName = usePathname();

  return (
    <div className="sticky top-0 z-50 bg-white/98 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="flex justify-between items-center px-6 py-2 max-w-7xl mx-auto">
        {/* Logo Section */}
        <Link href="/" className="flex items-center group">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
            <div className="relative transition-all duration-300 group-hover:scale-[1.02] filter drop-shadow-sm">
              <Image
                src="/header_logo/main-logo.png"
                alt="ManSolHub Logo"
                width={100}
                height={48}
                className="h-12 w-auto object-contain"
                priority
              />
            </div>
          </div>
        </Link>

        {/* Center Brand Text - Optional elegant addition */}
        <div className="hidden lg:flex items-center">
          <div className="text-center">
            <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Learning Management System
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              Excellence in Education
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative h-8 w-8 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <Menu className="w-4 h-4 text-slate-600" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-gradient-to-br from-slate-50 to-white border-l border-slate-200 w-80">
                <SheetHeader className="text-left pb-6">
                  <SheetTitle className="text-slate-800 font-bold text-xl">
                    Navigation
                  </SheetTitle>
                  <SheetDescription className="text-slate-600">
                    Access your learning dashboard
                  </SheetDescription>
                </SheetHeader>
                
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm text-slate-600 text-center">
                      Welcome to your learning journey
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* User Authentication */}
          {isSignedIn ? (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
              <div className="relative">
                <UserButton 
                  afterSignOutUrl="/sign-in" 
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 ring-2 ring-slate-200 hover:ring-blue-300",
                      userButtonPopoverCard: "shadow-2xl border border-slate-200",
                      userButtonPopoverActionButton: "hover:bg-slate-50"
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/sign-in">
                <Button 
                  variant="ghost" 
                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-medium px-3 py-1.5 rounded-xl transition-all duration-300 text-sm"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-1.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0 text-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
