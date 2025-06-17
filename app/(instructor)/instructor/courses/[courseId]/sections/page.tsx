import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BookOpen, Plus, Video, FileText } from "lucide-react";

import CreateSectionForm from "@/components/sections/CreateSectionForm";
import { db } from "@/lib/db";

const CourseCurriculumPage = async ({ params }: { params: { courseId: string }}) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      instructorId: userId,
    },
    include: {
      sections: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    return redirect("/instructor/courses");
  }

  const totalSections = course.sections.length;
  const publishedSections = course.sections.filter(section => section.isPublished).length;
  const totalVideos = course.sections.filter(section => section.videoUrl).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Course Curriculum</h1>
              <p className="text-blue-100 mt-1">Structure your course content and lessons</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-lg mb-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{totalSections}</div>
              <div className="text-blue-100 text-sm">Total Sections</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-lg mb-3">
                <Video className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{totalVideos}</div>
              <div className="text-blue-100 text-sm">Video Lessons</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-lg mb-3">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{publishedSections}</div>
              <div className="text-blue-100 text-sm">Published</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Course Structure</h2>
                <p className="text-slate-600 text-sm">Organize your lessons and create engaging content</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <CreateSectionForm course={course} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCurriculumPage;