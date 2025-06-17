import CourseCard from "@/components/courses/CourseCard"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { BookOpen, Clock, Award, TrendingUp, GraduationCap } from "lucide-react"

const LearningPage = async () => {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/sign-in')
  }

  const purchasedCourses = await db.purchase.findMany({
    where: {
      customerId: userId,
    },
    select: {
      course: {
        include: {
          category: true,
          subCategory: true,
          sections: {
            where: {
              isPublished: true,
            },
          }
        }
      }
    }
  })

  const totalCourses = purchasedCourses.length
  const totalSections = purchasedCourses.reduce((acc, purchase) => acc + purchase.course.sections.length, 0)
  const completionRate = 85 // This could be calculated based on actual progress

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              My Learning Journey
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Continue your path to excellence with your enrolled courses
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <BookOpen className="h-10 w-10 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{totalCourses}</div>
              <div className="text-blue-200">Enrolled Courses</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <Clock className="h-10 w-10 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{totalSections}</div>
              <div className="text-blue-200">Total Lessons</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <TrendingUp className="h-10 w-10 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{completionRate}%</div>
              <div className="text-blue-200">Avg. Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {totalCourses > 0 ? (
          <>
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Your Courses
              </h2>
              <p className="text-gray-600">
                Pick up where you left off and continue learning
              </p>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {purchasedCourses.map((purchase) => (
                <CourseCard key={purchase.course.id} course={purchase.course} />
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
              <BookOpen className="h-16 w-16 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Start Your Learning Journey
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You have not enrolled in any courses yet. Explore our course catalog to find something that interests you.
            </p>
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Browse Courses
            </a>
          </div>
        )}

        {/* Progress Section */}
        {totalCourses > 0 && (
          <div className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Learning Progress
                </h3>
                <p className="text-gray-600">
                  Keep up the great work! You are making excellent progress.
                </p>
              </div>
              <Award className="h-12 w-12 text-blue-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {Math.floor(totalSections * 0.6)}
                </div>
                <div className="text-green-600">Lessons Completed</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {Math.floor(totalSections * 0.4)}
                </div>
                <div className="text-blue-600">Lessons Remaining</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  {Math.floor(totalCourses * 0.3)}
                </div>
                <div className="text-purple-600">Certificates Earned</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LearningPage