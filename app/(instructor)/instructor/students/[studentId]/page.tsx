import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { User, Mail, Calendar, GraduationCap, Users, BookOpen, Edit } from "lucide-react";
import Link from "next/link";

import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StudentDetailPageProps {
  params: {
    studentId: string;
  };
}

const StudentDetailPage = async ({ params }: StudentDetailPageProps) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const student = await db.student.findUnique({
    where: {
      id: params.studentId,
      addedById: userId,
    },
    include: {
      enrollments: {
        include: {
          course: true,
        },
      },
      attendances: {
        include: {
          course: true, 
          teacher: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: 10,
      },
    },
  });

  if (!student) {
    return redirect("/instructor/students");
  }

  // Get the assigned teacher for this student's class and section
  const assignedTeacher = student.class && student.section 
    ? await db.teacher.findFirst({
        where: {
          assignedClass: student.class,
          assignedSection: student.section,
          addedById: userId,
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      })
    : null;

  const attendanceRate = student.attendances.length > 0 
    ? (student.attendances.filter(a => a.isPresent).length / student.attendances.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {student.firstName} {student.lastName}
                </h1>
                <p className="text-blue-100 mt-1">Student Details</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/instructor/students/edit/${student.id}`}>
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Student
                </Button>
              </Link>
              <Link href="/instructor/students">
                <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                  Back to Students
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Basic Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-slate-600">Class</p>
                      <p className="font-medium">{student.class || 'Not assigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-slate-600">Section</p>
                      <p className="font-medium">{student.section || 'Not assigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-slate-600">Age</p>
                      <p className="font-medium">{student.age || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      student.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <Badge variant={student.isActive ? "default" : "secondary"}>
                        {student.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Information Card */}
            {assignedTeacher && (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-800">Assigned Teacher</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <User className="h-8 w-8 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">
                        {assignedTeacher.firstName} {assignedTeacher.lastName}
                      </h3>
                      <p className="text-sm text-slate-600">{assignedTeacher.email}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Class Teacher for {student.class} - {student.section}
                      </p>
                    </div>
                    <Link href={`/instructor/teachers/${assignedTeacher.id}`}>
                      <Button variant="outline">
                        View Teacher
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Enrollments Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Course Enrollments</h2>
              </div>
              <div className="p-6">
                {student.enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {student.enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <h3 className="font-medium">{enrollment.course.title}</h3>
                          <p className="text-sm text-slate-600">Enrolled on {new Date(enrollment.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No course enrollments yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Quick Stats</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{student.enrollments.length}</div>
                  <div className="text-sm text-slate-600">Total Enrollments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{attendanceRate.toFixed(1)}%</div>
                  <div className="text-sm text-slate-600">Attendance Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{student.attendances.length}</div>
                  <div className="text-sm text-slate-600">Total Classes</div>
                </div>
              </div>
            </div>

            {/* Recent Attendance */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Recent Attendance</h2>
              </div>
              <div className="p-6">
                {student.attendances.length > 0 ? (
                  <div className="space-y-3">
                    {student.attendances
                      .slice(0, 5)
                      .map((attendance) => (
                      <div key={attendance.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{attendance.course?.title || 'General Class Attendance'}</p>
                            <p className="text-xs text-slate-600">{new Date(attendance.date).toLocaleDateString()}</p>
                            {attendance.teacher && (
                              <p className="text-xs text-slate-500">
                                Teacher: {attendance.teacher.firstName} {attendance.teacher.lastName}
                              </p>
                            )}
                          </div>
                          <Badge variant={attendance.isPresent ? "default" : "destructive"}>
                            {attendance.isPresent ? "Present" : "Absent"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-600 text-sm">No attendance records</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;