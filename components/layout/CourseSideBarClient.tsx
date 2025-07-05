"use client";

import { Course, Section, Purchase } from "@prisma/client";
import Link from "next/link";
import { Progress } from "../ui/progress";
import { Play, CheckCircle, Clock, Target, Home, GraduationCap, FileText, Lock } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface CourseSideBarClientProps {
  course: Course;
  publishedSections: Section[];
  completedSections: number;
  purchase: Purchase | null;
  progressPercentage: number;
  progressMap: Map<string, boolean>;
}

export const CourseSideBarClient = ({ 
  course, 
  publishedSections, 
  completedSections, 
  purchase, 
  progressPercentage,
  progressMap
}: CourseSideBarClientProps) => {
  const router = useRouter();

  // Add effect to refresh when progressMap changes
  useEffect(() => {
    // This will help ensure the component re-renders when progress updates
  }, [progressMap]);
  
  // Function to check if a section is accessible
  const isSectionAccessible = (sectionIndex: number, section: Section) => {
    // First section is always accessible if purchased or free
    if (sectionIndex === 0) {
      return purchase || section.isFree;
    }
    
    // For subsequent sections, check if previous section is completed
    const previousSection = publishedSections[sectionIndex - 1];
    const isPreviousCompleted = progressMap.get(previousSection.id) || false;
    
    // Section is accessible if:
    // 1. User has purchased the course (or section is free) AND
    // 2. Previous section is completed
    return (purchase || section.isFree) && isPreviousCompleted;
  };

  return (
    <div className="hidden md:flex flex-col fixed left-0 top-0 w-80 h-screen bg-white border-r border-gray-200 shadow-lg z-40">
      {/* Compact Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 relative">
        {/* Profile and Course Info in one row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white leading-tight">{course.title}</h1>
              <p className="text-blue-200 text-xs">Course Content</p>
            </div>
          </div>
          <UserButton 
            afterSignOutUrl="/sign-in" 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 border-2 border-blue-200 hover:border-blue-400 transition-colors duration-300"
              }
            }}
          />
        </div>
        
        {/* Compact Progress Section */}
        {purchase && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Progress</span>
              <span className="text-lg font-bold text-white">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-white/20 rounded-full overflow-hidden"
            />
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-blue-200">{completedSections} of {publishedSections.length} lessons</span>
              {progressPercentage === 100 && (
                <div className="flex items-center space-x-1 text-emerald-300">
                  <CheckCircle className="h-3 w-3" />
                  <span>Complete!</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto py-4 px-3 bg-gray-50">
        {/* Quick Actions - Compact */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Quick Actions</h3>
          <div className="space-y-1">
            <Link
              href="/"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-white hover:shadow-sm transition-all duration-200 group"
            >
              <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Home className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Home</span>
            </Link>
            
            <Link
              href={`/courses/${course.id}/overview`}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white shadow-sm border border-gray-200 text-gray-700 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <FileText className="h-3 w-3 text-indigo-600" />
              </div>
              <span className="text-sm font-medium">Course Overview</span>
            </Link>
          </div>
        </div>

        {/* Course Sections - Compact */}
        <div>
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sections</h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">
              {publishedSections.length}
            </span>
          </div>
          
          <div className="space-y-1">
            {publishedSections.map((section, index) => {
              const isCompleted = progressMap.get(section.id) || false;
              const isAccessible = isSectionAccessible(index, section);
              const isLocked = !isAccessible;
              
              return (
                <div key={section.id} className="group block">
                  {isLocked ? (
                    <div className="flex items-center space-x-3 px-3 py-3 rounded-lg border transition-all duration-200 bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed">
                      {/* Section Icon */}
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 bg-gray-200 text-gray-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      
                      {/* Section Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <h4 className="text-sm font-medium truncate text-gray-500">
                            {section.title}
                          </h4>
                        </div>
                        <span className="text-xs text-gray-500">Complete previous section</span>
                      </div>
                    </div>
                  ) : (
                    <Link href={`/courses/${course.id}/sections/${section.id}`}>
                      <div className="flex items-center space-x-3 px-3 py-3 rounded-lg border transition-all duration-200 bg-white border-gray-200 hover:border-indigo-200 hover:shadow-sm">
                        {/* Section Icon */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          isCompleted 
                            ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200' 
                            : section.isFree 
                              ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                              : 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : section.isFree ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        
                        {/* Section Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <h4 className="text-sm font-medium truncate text-gray-900 group-hover:text-indigo-600">
                              {section.title}
                            </h4>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isCompleted 
                                ? 'bg-emerald-100 text-emerald-700'
                                : section.isFree 
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-amber-100 text-amber-700'
                            }`}>
                              {isCompleted ? 'Completed' : section.isFree ? 'Free' : 'Premium'}
                            </span>
                            
                            {isCompleted && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        {/* Arrow Indicator */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="w-2 h-2 border-r-2 border-b-2 border-indigo-400 transform rotate-[-45deg]"></div>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Empty State */}
          {publishedSections.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No sections yet</h3>
              <p className="text-xs text-gray-500">Course content will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Compact Footer Stats */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-3 border border-indigo-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Course Progress</h4>
              <p className="text-xs text-gray-600">
                {publishedSections.length} sections • {Math.round(progressPercentage)}% complete
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-indigo-600">{completedSections}</div>
              <div className="text-xs text-gray-500">done</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};