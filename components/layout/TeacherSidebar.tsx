"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Calendar, Home, Video } from "lucide-react";

const TeacherSidebar = () => {
  const pathname = usePathname();

  const sidebarItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/teacher",
    },
    {
      icon: Users,
      label: "Students",
      href: "/teacher/students",
    },
    {
      icon: Calendar,
      label: "Attendance",
      href: "/teacher/attendance",
    },
    {
      icon: Video,
      label: "Meetings",
      href: "https://zoom-mansolehubtraining.vercel.app",
    },
  ];

  const isActiveRoute = (href: string) => {
    // For external links, never mark as active
    if (href.startsWith('http')) return false;
    
    // For exact dashboard route, only match exactly
    if (href === '/teacher') {
      return pathname === '/teacher';
    }
    
    // For other routes, use startsWith logic
    return pathname?.startsWith(href);
  };

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto bg-gradient-to-b from-slate-50 to-white shadow-lg">
      {/* Header Section */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Teacher Portal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage your classes</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col w-full py-4 px-3 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-x-3 text-sm font-medium px-3 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                isActive 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25" 
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/80"
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
              )}
              
              {/* Icon with background */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-white/20" 
                  : "bg-slate-200/50 group-hover:bg-slate-300/60"
              }`}>
                <Icon 
                  size={18} 
                  className={`transition-all duration-200 ${
                    isActive ? "text-white" : "text-slate-600 group-hover:text-slate-800"
                  }`} 
                />
              </div>
              
              {/* Label */}
              <span className="font-medium">{item.label}</span>
              
              {/* Hover effect */}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-600/0 group-hover:from-blue-500/5 group-hover:to-purple-600/5 transition-all duration-200" />
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Footer */}
      <div className="mt-auto p-4 border-t border-slate-200/60">
        <div className="text-xs text-slate-400 text-center">
          <p>Academy LMS v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherSidebar;