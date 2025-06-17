import Image from "next/image";
import { redirect } from "next/navigation";
import { BookOpen, User, DollarSign, Award, Clock, Users, Star, Gem, Play, CheckCircle } from "lucide-react";
import { clerkClient } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import ReadText from "@/components/custom/ReadText";
import SectionMenu from "@/components/layout/SectionMenu";

const CourseOverview = async ({ params }: { params: { courseId: string } }) => {
  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      isPublished: true,
    },
    include: {
      sections: {
        where: {
          isPublished: true,
        },
      },
    },
  });

  if (!course) {
    return redirect("/");
  }
  
  const clerk = await clerkClient();
  const instructor = await clerk.users.getUser(course.instructorId);

  let level;

  if (course.levelId) {
    level = await db.level.findUnique({
      where: {
        id: course.levelId,
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative px-6 py-16 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Course Info */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Course Overview</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {course.title}
                </h1>
                
                {course.subtitle && (
                  <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
                    {course.subtitle}
                  </p>
                )}
              </div>
              
              {/* Course Stats */}
              <div className="flex flex-wrap gap-6">
                {[
                  { icon: Users, text: "Self-paced Learning" },
                  { icon: Clock, text: "Lifetime Access" },
                  { icon: Award, text: "Certificate Included" }
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <Icon className="h-5 w-5 text-blue-300" />
                      <span className="text-blue-100 font-medium">{stat.text}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* CTA Button */}
              <div className="flex gap-4">
                <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Play className="h-5 w-5" />
                  Start Learning
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300">
                  Preview Course
                </button>
              </div>
            </div>
            
            {/* Section Menu */}
            <div className="lg:justify-self-end">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                <SectionMenu course={course} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-16 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Course Description */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Course Description</h2>
              </div>
              
              <div className="prose prose-lg prose-gray max-w-none">
                <ReadText value={course.description!} />
              </div>
            </div>
            
            {/* What You'll Learn */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">What You will Learn</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  "Master the fundamentals and advanced concepts",
                  "Build real-world projects from scratch",
                  "Learn industry best practices",
                  "Get hands-on experience with tools",
                  "Develop problem-solving skills",
                  "Prepare for professional opportunities"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-3 flex-shrink-0" />
                    <span className="text-gray-700 font-medium leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Course Details Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Course Details</h3>
              
              <div className="space-y-6">
                {/* Price */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-green-800">Price</span>
                  </div>
                  <span className="text-3xl font-bold text-green-700">${course.price}</span>
                </div>
                
                {/* Level */}
                {level && (
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl shadow-lg">
                        <Gem className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-purple-800">Level</span>
                    </div>
                    <span className="font-bold text-purple-700">{level.name}</span>
                  </div>
                )}
                
                {/* Sections Count */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-blue-800">Sections</span>
                  </div>
                  <span className="font-bold text-blue-700">{course.sections.length}</span>
                </div>
              </div>
              
              {/* Enroll Button */}
              <div className="mt-8">
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Enroll Now
                </button>
              </div>
            </div>
            
            {/* Instructor Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Your Instructor</h3>
              </div>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <Image
                    src={
                      instructor.imageUrl
                        ? instructor.imageUrl
                        : "/avatar_placeholder.jpg"
                    }
                    alt={instructor.fullName ? instructor.fullName : "Instructor photo"}
                    width={80}
                    height={80}
                    className="rounded-2xl ring-4 ring-blue-100 shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xl mb-1">
                    {instructor.fullName || "Instructor"}
                  </h4>
                  <p className="text-blue-600 font-medium">Course Instructor</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                <p className="text-gray-700 leading-relaxed">
                  Expert instructor with years of experience in the field. 
                  Passionate about teaching and helping students succeed.
                </p>
              </div>
            </div>
            
            {/* Course Features */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Course Features</h3>
              
              <div className="space-y-4">
                {[
                  { icon: Clock, text: "Lifetime Access", color: "blue" },
                  { icon: Users, text: "Community Support", color: "green" },
                  { icon: Award, text: "Certificate of Completion", color: "purple" },
                  { icon: Star, text: "Expert Instruction", color: "yellow" }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  const colorClasses = {
                    blue: "from-blue-500 to-blue-600",
                    green: "from-green-500 to-green-600",
                    purple: "from-purple-500 to-purple-600",
                    yellow: "from-yellow-500 to-yellow-600"
                  };
                  return (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors duration-300">
                      <div className={`p-3 bg-gradient-to-r ${colorClasses[feature.color as keyof typeof colorClasses]} rounded-xl shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-700">{feature.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
