"use client";

import { Course, Section } from "@prisma/client";
import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import Link from "next/link";

import { Menu, BookOpen, Play, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

interface SectionMenuProps {
  course: Course & { sections: Section[] };
}

const SectionMenu = ({ course }: SectionMenuProps) => {
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="z-60 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm transition-all duration-300 shadow-lg"
          >
            <Menu className="h-4 w-4 mr-2" />
            Sections
          </Button>
        </SheetTrigger>
        <SheetContent className="w-80 p-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 border-l border-white/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Course Navigation</h2>
                <p className="text-blue-200 text-sm">{course.title}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col p-4 space-y-2">
            {/* Overview Link */}
            <Link
              href={`/courses/${course.id}/overview`}
              className={`group relative flex items-center p-4 rounded-xl transition-all duration-300 ${
                isActiveLink(`/courses/${course.id}/overview`)
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/70 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-700 hover:text-blue-700 border border-white/20 hover:border-blue-200/50'
              } backdrop-blur-sm hover:shadow-md hover:scale-[1.02]`}
            >
              <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                isActiveLink(`/courses/${course.id}/overview`)
                  ? 'bg-white/20'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 group-hover:scale-110'
              }`}>
                <BookOpen className={`h-4 w-4 ${
                  isActiveLink(`/courses/${course.id}/overview`) ? 'text-white' : 'text-white'
                }`} />
              </div>
              <div className="flex-1">
                <p className="font-medium">Course Overview</p>
                <p className={`text-xs ${
                  isActiveLink(`/courses/${course.id}/overview`) ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  Introduction and details
                </p>
              </div>
              {isActiveLink(`/courses/${course.id}/overview`) && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-1 h-8 bg-white rounded-full"></div>
                </div>
              )}
              <ChevronRight className={`h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 ${
                isActiveLink(`/courses/${course.id}/overview`) ? 'text-white' : 'text-gray-400'
              }`} />
            </Link>

            {/* Sections Divider */}
            <div className="flex items-center gap-3 py-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
              <span className="text-sm font-medium text-gray-600 bg-white/70 px-3 py-1 rounded-full">
                Sections ({course.sections.length})
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
            </div>

            {/* Section Links */}
            {course.sections.map((section, index) => {
              const sectionHref = `/courses/${course.id}/sections/${section.id}`;
              const isActive = isActiveLink(sectionHref);
              
              return (
                <Link
                  key={section.id}
                  href={sectionHref}
                  className={`group relative flex items-center p-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-white/70 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-700 hover:text-blue-700 border border-white/20 hover:border-blue-200/50'
                  } backdrop-blur-sm hover:shadow-md hover:scale-[1.02]`}
                >
                  <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 group-hover:scale-110'
                  }`}>
                    {section.isFree ? (
                      <Play className={`h-4 w-4 ${
                        isActive ? 'text-white' : 'text-white'
                      }`} />
                    ) : (
                      <Clock className={`h-4 w-4 ${
                        isActive ? 'text-white' : 'text-white'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {index + 1}
                      </span>
                      <p className="font-medium truncate">{section.title}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-xs ${
                        isActive ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {section.isFree ? 'Free Preview' : 'Premium Content'}
                      </p>
                      {section.isFree && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive 
                            ? 'bg-emerald-400/20 text-emerald-100' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          FREE
                        </span>
                      )}
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="w-1 h-8 bg-white rounded-full"></div>
                    </div>
                  )}
                  <ChevronRight className={`h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`} />
                </Link>
              );
            })}

            {/* Footer */}
            <div className="mt-6 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Course Progress</p>
                  <p className="text-xs text-gray-500">
                    {course.sections.length} sections available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SectionMenu;
