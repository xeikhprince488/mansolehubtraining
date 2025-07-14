"use client";

import { BarChart4, MonitorPlay, GraduationCap, Users, CreditCard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  const sidebarRoutes = [
    { 
      icon: MonitorPlay, 
      label: "Courses", 
      path: "/instructor/courses",
      description: "Manage your courses"
    },
    {
      icon: BarChart4,
      label: "Performance",
      path: "/instructor/performance",
      description: "View analytics"
    },
    {
      icon: CreditCard,
      label: "Payments",
      path: "/instructor/payments",
      description: "Manage payment requests"
    },
    {
      icon: Users,
      label: "Users",
      path: "/instructor/users",
      description: "Manage all users"
    },
    {
      icon: Users,
      label: "Teachers",
      path: "/instructor/teachers",
      description: "Manage Teachers"
    },
    {
      icon: GraduationCap,
      label: "Students",
      path: "/instructor/students",
      description: "Manage Students "
    },
  ];

  return (
    <div className="max-sm:hidden flex flex-col w-72 border-r border-blue-100 bg-gradient-to-b from-blue-50/50 to-indigo-50/30 shadow-lg backdrop-blur-sm">
      {/* Header Section */}
      <div className="p-6 border-b border-blue-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-900">Instructor</h2>
            <p className="text-sm text-blue-600">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {sidebarRoutes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname.startsWith(route.path);
            
            return (
              <Link
                href={route.path}
                key={route.path}
                className={`group relative flex items-center p-4 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-blue-700 hover:bg-white hover:shadow-md hover:scale-[1.01]'
                }`}
              >
                {/* Background Glow Effect */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl blur-sm -z-10" />
                )}
                
                {/* Icon Container */}
                <div className={`flex-shrink-0 p-2 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'bg-gradient-to-r from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200'
                }`}>
                  <Icon className={`h-5 w-5 transition-all duration-300 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-blue-600 group-hover:text-blue-700 group-hover:scale-110'
                  }`} />
                </div>
                
                {/* Content */}
                <div className="ml-4 flex-1">
                  <div className={`font-semibold text-sm transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-blue-900 group-hover:text-blue-800'
                  }`}>
                    {route.label}
                  </div>
                  <div className={`text-xs transition-colors duration-300 ${
                    isActive ? 'text-blue-100' : 'text-blue-500 group-hover:text-blue-600'
                  }`}>
                    {route.description}
                  </div>
                </div>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                )}
                
                {/* Hover Arrow */}
                {!isActive && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-blue-400 transform rotate-[-45deg]" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-blue-100">
        <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-800">Need Help?</p>
              <p className="text-xs text-blue-600">Check our documentation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
