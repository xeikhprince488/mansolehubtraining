import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, BookOpen, Users, TrendingUp, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { DataTable } from "@/components/custom/DataTable";
import { columns } from "@/components/courses/Columns";

const CoursesPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const courses = await db.course.findMany({
    where: {
      instructorId: userId,
    },
    include: {
      purchases: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const publishedCourses = courses.filter(course => course.isPublished);
  const draftCourses = courses.filter(course => !course.isPublished);
  const totalStudents = courses.reduce((acc, course) => acc + (course.purchases?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                Instructor Dashboard
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Manage your courses, track performance, and inspire learners worldwide
              </p>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mx-auto mb-4">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{courses.length}</div>
                  <div className="text-blue-100 text-sm">Total Courses</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{publishedCourses.length}</div>
                  <div className="text-blue-100 text-sm">Published</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-lg mx-auto mb-4">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{draftCourses.length}</div>
                  <div className="text-blue-100 text-sm">Drafts</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-lg mx-auto mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{totalStudents}</div>
                  <div className="text-blue-100 text-sm">Students</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Course Management</h2>
            <p className="text-slate-600">Create, edit, and manage your educational content</p>
          </div>
          
          <Link 
            href="/instructor/create-course"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 inline-flex"
          >
            <Plus className="h-5 w-5" />
            Create New Course
          </Link>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Your Courses</h3>
            <p className="text-slate-600 text-sm mt-1">Manage and track all your educational content</p>
          </div>
          
          <div className="p-6">
            {courses.length > 0 ? (
              <DataTable columns={columns} data={courses} />
            ) : (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No courses yet</h3>
                <p className="text-slate-600 mb-6">Start creating your first course to share your knowledge</p>
                <Link 
                  href="/instructor/create-course"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Course
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
