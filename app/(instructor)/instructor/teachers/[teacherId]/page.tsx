import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { User, Mail, Calendar, GraduationCap, Users, Edit } from "lucide-react";
import Link from "next/link";

import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeacherDetailPageProps {
  params: {
    teacherId: string;
  };
}

const TeacherDetailPage = async ({ params }: TeacherDetailPageProps) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const teacher = await db.teacher.findUnique({
    where: {
      id: params.teacherId,
      addedById: userId,
    },
    include: {
      attendances: {
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
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

  if (!teacher) {
    return redirect("/instructor/teachers");
  }

  // Get students enrolled in teacher's assigned class and section
  const enrolledStudents = teacher.assignedClass && teacher.assignedSection 
    ? await db.student.findMany({
        where: {
          class: teacher.assignedClass,
          section: teacher.assignedSection,
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
    : [];

  const totalClasses = teacher.attendances.length;
  const uniqueStudents = new Set(teacher.attendances.map(a => a.studentId)).size;

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
                  {teacher.firstName} {teacher.lastName}
                </h1>
                <p className="text-blue-100 mt-1">Teacher Details</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/instructor/teachers/edit/${teacher.id}`}>
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Teacher
                </Button>
              </Link>
              <Link href="/instructor/teachers">
                <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                  Back to Teachers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teacher Information */}
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
                      <p className="font-medium">{teacher.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-slate-600">Assigned Class</p>
                      <p className="font-medium">{teacher.assignedClass || 'Not assigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-slate-600">Assigned Section</p>
                      <p className="font-medium">{teacher.assignedSection || 'Not assigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-slate-600">Added On</p>
                      <p className="font-medium">{new Date(teacher.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      teacher.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <Badge variant={teacher.isActive ? "default" : "secondary"}>
                        {teacher.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrolled Students Card */}
            {teacher.assignedClass && teacher.assignedSection && (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-800">
                    Students in {teacher.assignedClass} - {teacher.assignedSection}
                  </h2>
                </div>
                <div className="p-6">
                  {enrolledStudents.length > 0 ? (
                    <div className="space-y-4">
                      {enrolledStudents.map((student) => (
                        <div key={student.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                          <User className="h-5 w-5 text-blue-600" />
                          <div className="flex-1">
                            <h3 className="font-medium">{student.firstName} {student.lastName}</h3>
                            <p className="text-sm text-slate-600">{student.email}</p>
                          </div>
                          <Link href={`/instructor/students/${student.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">No students enrolled in this class/section yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Activity Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Recent Teaching Activity</h2>
              </div>
              <div className="p-6">
                {teacher.attendances.length > 0 ? (
                  <div className="space-y-4">
                    {teacher.attendances.slice(0, 5).map((attendance) => (
                      <div key={attendance.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <h3 className="font-medium">Attendance Record</h3>
                          <p className="text-sm text-slate-600">
                            Student: {attendance.student.firstName} {attendance.student.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{new Date(attendance.date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={attendance.isPresent ? "default" : "destructive"}>
                          {attendance.isPresent ? "Present" : "Absent"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No teaching activity yet</p>
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
                <h2 className="text-lg font-semibold text-slate-800">Teaching Stats</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalClasses}</div>
                  <div className="text-sm text-slate-600">Total Classes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{uniqueStudents}</div>
                  <div className="text-sm text-slate-600">Students Taught</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{enrolledStudents.length}</div>
                  <div className="text-sm text-slate-600">Enrolled Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-slate-600">Joined Date</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailPage;