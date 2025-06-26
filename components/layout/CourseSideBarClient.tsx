"use client";

import { Course, Section, Purchase } from "@prisma/client";
import Link from "next/link";
import { Progress } from "../ui/progress";
import { Play, CheckCircle, Clock, Target, Home, GraduationCap, FileText, Lock, PlayCircle, CheckCircle2 } from "lucide-react";
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
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-800 via-blue-800 to-indigo-900 text-white p-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
        </div>
        
        {/* Profile Section Only */}
        <div className="relative z-10">
          <div className="flex items-center justify-end mb-6">
            {/* Profile Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <UserButton 
                afterSignOutUrl="/sign-in" 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 border-2 border-blue-200 hover:border-blue-400 transition-colors duration-300"
                  }
                }}
              />
            </div>
          </div>
          
          {/* Course Info */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white leading-tight mb-1">{course.title}</h1>
                <p className="text-blue-200 text-sm font-medium">Course Content</p>
              </div>
            </div>
          </div>
          
          {/* Progress Section */}
          {purchase && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">Your Progress</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{Math.round(progressPercentage)}%</div>
                  <div className="text-xs text-blue-200">Complete</div>
                </div>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2 bg-white/20 rounded-full overflow-hidden"
              />
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-blue-200">{completedSections} of {publishedSections.length} lessons</span>
                {progressPercentage === 100 && (
                  <div className="flex items-center space-x-1 text-emerald-300">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Completed!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto py-6 px-4 bg-gray-50">
        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              href="/"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Home className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium">Home</span>
            </Link>
            
            <Link
              href={`/courses/${course.id}/overview`}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white shadow-sm border border-gray-200 text-gray-700 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <FileText className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Course Overview</div>
                <div className="text-xs text-gray-500">Introduction & details</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Course Sections */}
        <div>
          <div className="flex items-center justify-between mb-4 px-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Sections</h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">
              {publishedSections.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {publishedSections.map((section, index) => {
              const isCompleted = progressMap.get(section.id) || false;
              const isAccessible = isSectionAccessible(index, section);
              const isLocked = !isAccessible;
              
              return (
                <div key={section.id} className="group block">
                  {isLocked ? (
                    <div className={`flex items-center space-x-3 px-4 py-4 rounded-xl border transition-all duration-200 bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed`}>
                      {/* Section Icon */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 bg-gray-200 text-gray-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      
                      {/* Section Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <h4 className="font-semibold truncate transition-colors text-gray-500">
                            {section.title}
                          </h4>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-200 text-gray-500">
                            Locked
                          </span>
                          <span className="text-xs text-gray-500">Complete previous section</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link href={`/courses/${course.id}/sections/${section.id}`}>
                      <div className="flex items-center space-x-3 px-4 py-4 rounded-xl border transition-all duration-200 bg-white border-gray-200 hover:border-indigo-200 hover:shadow-md">
                        {/* Section Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          isCompleted 
                            ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200' 
                            : section.isFree 
                              ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                              : 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : section.isFree ? (
                            <Play className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>
                        
                        {/* Section Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <h4 className="font-semibold truncate transition-colors text-gray-900 group-hover:text-indigo-600">
                              {section.title}
                            </h4>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
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
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No sections yet</h3>
              <p className="text-sm text-gray-500">Course content will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">Course Progress</h4>
              <p className="text-xs text-gray-600">
                {publishedSections.length} sections • {Math.round(progressPercentage)}% complete
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-indigo-600">{completedSections}</div>
              <div className="text-xs text-gray-500">completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};