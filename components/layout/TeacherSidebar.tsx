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

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800">Teacher Portal</h2>
      </div>
      <div className="flex flex-col w-full">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20 ${
                isActive && "text-sky-700 bg-sky-200/20 hover:bg-sky-200/20 hover:text-sky-700"
              }`}
            >
              <div className="flex items-center gap-x-2 py-4">
                <Icon size={22} className={isActive ? "text-sky-700" : ""} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherSidebar;