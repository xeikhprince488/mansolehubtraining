import { db } from "@/lib/db";
import getCoursesByCategory from "../actions/getCourses";
import Categories from "@/components/custom/Categories";
import CourseCard from "@/components/courses/CourseCard";
import { BookOpen, Users, Award, TrendingUp, Search } from "lucide-react";
import SearchComponent from "@/components/custom/SearchComponent";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Define instructor emails
const instructorEmails = [
  'programmingworld488@gmail.com',
  'ceo@largifysolutions.com'
];

export default async function Home() {
  // Check if user is authenticated and redirect based on role
  const { userId } = await auth();
  
  if (userId) {
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    
    if (userEmail) {
      // Check if user is an instructor
      if (instructorEmails.includes(userEmail)) {
        redirect('/instructor/courses');
      }
      
      // Check if user is a teacher
      const teacher = await db.teacher.findFirst({
        where: {
          email: userEmail,
          isActive: true,
        },
      });
      
      if (teacher) {
        redirect('/teacher');
      }
    }
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      subCategories: {
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  const courses = await getCoursesByCategory(null);
  const totalCourses = courses.length;
  const totalCategories = categories.length;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Transform Your Future
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Discover world-class courses designed to accelerate your career and unlock your potential
            </p>
            
            {/* Enhanced Search Section */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchComponent />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                <div className="text-2xl font-bold">{totalCourses}+</div>
                <div className="text-sm text-blue-200">Courses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-blue-200">Students</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Award className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                <div className="text-2xl font-bold">{totalCategories}+</div>
                <div className="text-sm text-blue-200">Categories</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm text-blue-200">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Our Courses
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our comprehensive collection of courses across various categories
          </p>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <Categories categories={categories} selectedCategory={null} />
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No courses available
            </h3>
            <p className="text-gray-600">
              Check back later for new courses or try a different category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
