import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AttendanceForm from "@/components/teacher/AttendanceForm";
import { db } from "@/lib/db";
import { Calendar } from "lucide-react";
const AttendancePage = async () => {
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
  const students = await db.student.findMany({
    where: {
      class: teacher.assignedClass,
      section: teacher.assignedSection,
      isActive: true,
    },
    orderBy: {
      firstName: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Attendance Management</h1>
              <p className="text-blue-100 mt-1">
                Mark attendance for Class {teacher.assignedClass} - Section {teacher.assignedSection}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AttendanceForm 
          students={students} 
          teacherId={teacher.id}
          assignedClass={teacher.assignedClass ?? undefined}
          assignedSection={teacher.assignedSection ?? undefined}
        />
      </div>
    </div>
  );
};

export default AttendancePage;