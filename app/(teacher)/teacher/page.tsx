import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Users, Calendar, TrendingUp, UserCheck, UserX, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import Link from "next/link";

const TeacherDashboard = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  // Get the current user to access email
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  if (!userEmail) {
    return redirect("/");
  }

  // Get teacher details with assigned class and section
  const teacher = await db.teacher.findFirst({
    where: {
      email: userEmail,
      isActive: true,
    },
  });

  if (!teacher) {
    return redirect("/");
  }

  // Get students from teacher's assigned class and section
  const assignedStudents = await db.student.findMany({
    where: {
      class: teacher.assignedClass,
      section: teacher.assignedSection,
      isActive: true,
    },
    orderBy: {
      firstName: "asc",
    },
  });

  // Get today's attendance for assigned students
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAttendance = await db.attendance.findMany({
    where: {
      teacherId: teacher.id,
      date: {
        gte: today,
        lt: tomorrow,
      },
      student: {
        class: teacher.assignedClass,
        section: teacher.assignedSection,
      },
    },
    include: {
      student: true,
    },
  });

  // Calculate stats
  const totalStudents = assignedStudents.length;
  const presentToday = todayAttendance.filter(a => a.isPresent).length;
  const absentToday = todayAttendance.filter(a => !a.isPresent).length;
  const attendanceRate = totalStudents > 0 ? ((presentToday / totalStudents) * 100).toFixed(1) : 0;

  // Get recent attendance activity
  const recentAttendance = await db.attendance.findMany({
    where: {
      teacherId: teacher.id,
      student: {
        class: teacher.assignedClass,
        section: teacher.assignedSection,
      },
    },
    include: {
      student: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
              <p className="text-blue-100 mt-1">
                Welcome back, {teacher.firstName} {teacher.lastName}!
              </p>
              <div className="flex items-center gap-4 mt-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  Class: {teacher.assignedClass}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  Section: {teacher.assignedSection}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{totalStudents}</div>
              <p className="text-xs text-slate-500">In your class & section</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Present Today</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{presentToday}</div>
              <p className="text-xs text-slate-500">Students present</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Absent Today</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{absentToday}</div>
              <p className="text-xs text-slate-500">Students absent</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{attendanceRate}%</div>
              <p className="text-xs text-slate-500">Today&apos;s rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/teacher/attendance">
                <Button className="w-full justify-start h-auto p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Calendar className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Mark Today&apos;s Attendance</div>
                    <div className="text-sm text-blue-100">Record student attendance for today</div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/teacher/students">
                <Button variant="outline" className="w-full justify-start h-auto p-4 border-2">
                  <Users className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">View My Students</div>
                    <div className="text-sm text-slate-600">Manage students in your class</div>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAttendance.length > 0 ? (
                  recentAttendance.map((attendance) => (
                    <div key={attendance.id} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        attendance.isPresent ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">
                          {attendance.student.firstName} {attendance.student.lastName} - 
                          <span className={attendance.isPresent ? 'text-green-600' : 'text-red-600'}>
                            {attendance.isPresent ? 'Present' : 'Absent'}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(attendance.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
