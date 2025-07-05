import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { Course } from "@prisma/client";
import { BookOpen, Clock, Users, Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CourseCard = async ({ course }: { course: Course }) => {
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
    <Link
      href={`/courses/${course.id}/overview`}
      className="group block bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-700 border border-gray-100 hover:border-gray-200 overflow-hidden transform hover:-translate-y-1 hover:scale-[1.02]"
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100">
        <Image
          src={course.imageUrl || "/image_placeholder.webp"}
          alt={course.title}
          width={400}
          height={240}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
        
        {/* Level Badge */}
        {level && (
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-slate-700 shadow-lg border border-white/20">
              <BookOpen className="w-3 h-3 mr-1.5" />
              {level.name}
            </span>
          </div>
        )}
        
        {/* Rating */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-lg border border-white/20">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span className="text-xs font-semibold text-slate-700">4.8</span>
          </div>
        </div>
        
        {/* Price Badge */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-slate-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-2xl shadow-lg border border-white/10">
            <span className="text-lg font-bold">PKR {course.price}</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Course Title */}
        <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-slate-700 transition-colors duration-300">
          {course.title}
        </h3>
        
        {/* Course Meta */}
        <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Self-paced</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>1.2k students</span>
          </div>
        </div>
        
        {/* Instructor */}
        {instructor && (
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <Image
                src={instructor.imageUrl || "/avatar_placeholder.jpg"}
                alt={instructor.fullName || "Instructor"}
                width={40}
                height={40}
                className="rounded-full border-2 border-gray-100 shadow-sm"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">
                {instructor.fullName || "Instructor"}
              </p>
              <p className="text-xs text-slate-500">Course Instructor</p>
            </div>
          </div>
        )}
        
        {/* Action Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-sm font-medium text-slate-600">Available Now</span>
          </div>
          
          <div className="flex items-center gap-2 text-slate-700 group-hover:text-slate-900 transition-colors duration-300">
            <span className="font-semibold text-sm">View Course</span>
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Border Accent */}
      <div className="h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 group-hover:from-blue-400 group-hover:via-indigo-500 group-hover:to-purple-400 transition-all duration-700" />
    </Link>
  );
};

export default CourseCard;
