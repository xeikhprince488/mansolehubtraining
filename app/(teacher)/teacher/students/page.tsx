import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Users, UserCheck, UserX, Search, Filter, Eye, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import Link from "next/link";
import StudentManagementClient from "@/components/teacher/StudentManagementClient";

const StudentsPage = async () => {
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

  // Get students from teacher's assigned class and section with attendance data
  const students = await db.student.findMany({
    where: {
      class: teacher.assignedClass,
      section: teacher.assignedSection,
      isActive: true,
    },
    include: {
      attendances: {
        where: {
          teacherId: teacher.id,
        },
        orderBy: {
          date: "desc",
        },
        take: 30, // Last 30 attendance records
      },
    },
    orderBy: {
      firstName: "asc",
    },
  });

  // Calculate attendance statistics for each student
  const studentsWithStats = students.map(student => {
    const totalAttendance = student.attendances.length;
    const presentCount = student.attendances.filter(a => a.isPresent).length;
    const attendanceRate = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : 0;
    
    return {
      ...student,
      attendanceRate: parseFloat(attendanceRate as string),
      totalAttendance,
      presentCount,
    };
  });

  const activeStudents = studentsWithStats.filter(s => s.isActive);
  const totalStudents = activeStudents.length;

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
              <h1 className="text-3xl font-bold">My Students</h1>
              <p className="text-blue-100 mt-1">
                Manage students in Class {teacher.assignedClass} - Section {teacher.assignedSection}
              </p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-lg mb-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{totalStudents}</div>
              <div className="text-blue-100 text-sm">Total Students</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-lg mb-3">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{activeStudents.length}</div>
              <div className="text-blue-100 text-sm">Active Students</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-500/20 rounded-lg mb-3">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">
                {totalStudents > 0 ? 
                  (studentsWithStats.reduce((sum, s) => sum + s.attendanceRate, 0) / totalStudents).toFixed(1)
                  : 0
                }%
              </div>
              <div className="text-blue-100 text-sm">Avg Attendance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <StudentManagementClient 
          students={studentsWithStats} 
          teacherId={teacher.id}
          assignedClass={teacher.assignedClass ?? undefined}
          assignedSection={teacher.assignedSection ?? undefined}
        />
      </div>
    </div>
  );
};

export default StudentsPage;