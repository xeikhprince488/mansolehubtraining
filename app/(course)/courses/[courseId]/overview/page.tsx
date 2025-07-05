import Image from "next/image"
import { redirect } from "next/navigation"
import { BookOpen, User, Award, Clock, Users, Star, CheckCircle, ShoppingCart, Play } from "lucide-react"
import { clerkClient } from "@clerk/nextjs/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import ReadText from "@/components/custom/ReadText"
import CourseOverviewClient from "./CourseOverviewClient"

const CourseOverview = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = await auth()
  const user = await currentUser()

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
  })

  if (!course) {
    return redirect("/")
  }

  // Check if user has purchased the course
  let purchase = null
  if (userId && user?.emailAddresses?.[0]?.emailAddress) {
    const customerEmail = user.emailAddresses[0].emailAddress
    purchase = await db.purchase.findUnique({
      where: {
        customerEmail_courseId: {
          customerEmail: customerEmail,
          courseId: course.id,
        },
      },
    })
  }

  const clerk = await clerkClient()
  const instructor = await clerk.users.getUser(course.instructorId)

  let level
  if (course.levelId) {
    level = await db.level.findUnique({
      where: {
        id: course.levelId,
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="px-6 py-8 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Course Overview</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{course.title}</h1>

              {course.subtitle && <p className="text-lg text-blue-100 leading-relaxed">{course.subtitle}</p>}

              {/* Course Stats */}
              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  { icon: Users, text: "Self-paced" },
                  { icon: Clock, text: "Lifetime Access" },
                  // { icon: Award, text: "Certificate" },
                ].map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                    >
                      <Icon className="h-4 w-4 text-blue-300" />
                      <span className="text-blue-100 text-sm font-medium">{stat.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Enhanced Purchase Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold text-white">PKR {course.price}</div>

                {purchase ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-emerald-300">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Already Purchased</span>
                    </div>
                    <a
                      href={`/courses/${course.id}/sections/${course.sections[0]?.id}`}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 block text-center"
                    >
                      Continue Learning
                    </a>
                  </div>
                ) : (
                  <CourseOverviewClient course={course} />
                )}

                <div className="text-xs text-blue-200 space-y-1">
                  <div>✓ {course.sections.length} Sections</div>
                  {level && <div>✓ {level.name} Level</div>}
                  <div>✓ Lifetime Access</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-6xl mx-auto">
        {/* Course Description */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Course Description</h2>
          </div>

          <div className="prose prose-gray prose-lg max-w-none leading-relaxed">
            <ReadText value={course.description!} />
          </div>
        </div>

        {/* Three Info Cards in Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Instructor Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Your Instructor</h3>
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="relative flex-shrink-0">
                <Image
                  src={instructor.imageUrl ? instructor.imageUrl : "/avatar_placeholder.jpg"}
                  alt={instructor.fullName ? instructor.fullName : "Instructor photo"}
                  width={64}
                  height={64}
                  className="rounded-xl ring-2 ring-blue-100 object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-lg truncate">{instructor.fullName || "Instructor"}</h4>
                <p className="text-blue-600 text-sm font-medium">Course Instructor</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                Expert instructor with years of experience in the field. Passionate about teaching and helping students
                succeed.
              </p>
            </div>
          </div>

          {/* Course Features */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Course Features</h3>

            <div className="space-y-4">
              {[
                { icon: Clock, text: "Lifetime Access", color: "blue" },
                { icon: Users, text: "Community Support", color: "green" },
                // { icon: Award, text: "Certificate of Completion", color: "purple" },
                { icon: Star, text: "Expert Instruction", color: "yellow" },
              ].map((feature, index) => {
                const Icon = feature.icon
                const colorClasses = {
                  blue: "from-blue-500 to-blue-600",
                  green: "from-green-500 to-green-600",
                  purple: "from-purple-500 to-purple-600",
                  yellow: "from-yellow-500 to-yellow-600",
                }
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className={`p-2 bg-gradient-to-r ${colorClasses[feature.color as keyof typeof colorClasses]} rounded-lg flex-shrink-0`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-700 text-sm flex-1">{feature.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Course Stats */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 md:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Course Details</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                <span className="font-medium text-green-800 text-sm">Price</span>
                <span className="text-xl font-bold text-green-700">PKR {course.price}</span>
              </div>

              {level && (
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <span className="font-medium text-purple-800 text-sm">Level</span>
                  <span className="font-bold text-purple-700">{level.name}</span>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                <span className="font-medium text-blue-800 text-sm">Sections</span>
                <span className="font-bold text-blue-700">{course.sections.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseOverview
