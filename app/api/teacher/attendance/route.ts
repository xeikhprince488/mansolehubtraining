import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the current user to access email
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!userEmail) {
      return new NextResponse("User email not found", { status: 400 });
    }

    // Verify teacher authorization
    const teacher = await db.teacher.findFirst({
      where: {
        email: userEmail,
        isActive: true,
      },
    });

    if (!teacher) {
      return new NextResponse("Teacher not found or inactive", { status: 403 });
    }

    const { teacherId, date, attendance, assignedClass, assignedSection } = await req.json();

    if (!teacherId || !date || !attendance) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify teacherId matches the authenticated teacher
    if (teacherId !== teacher.id) {
      return new NextResponse("Teacher ID mismatch", { status: 403 });
    }

    // Create or update attendance records for students in teacher's class/section
    const attendancePromises = Object.entries(attendance).map(async ([studentId, isPresent]) => {
      // Verify student belongs to teacher's class and section
      const student = await db.student.findFirst({
        where: {
          id: studentId,
          class: teacher.assignedClass,
          section: teacher.assignedSection,
          isActive: true,
        },
      });

      if (!student) {
        console.warn(`Student ${studentId} not found in teacher's assigned class/section`);
        return null;
      }

      return db.attendance.upsert({
        where: {
          studentId_teacherId_date: {  // Changed from studentId_courseId_date
            studentId,
            teacherId: teacher.id,
            date: new Date(date),
          },
        },
        update: {
          isPresent: isPresent as boolean,
          courseId: null,  // Explicitly set to null
        },
        create: {
          studentId,
          courseId: null,
          teacherId: teacher.id,
          date: new Date(date),
          isPresent: isPresent as boolean,
        },
      });
    });

    const results = await Promise.all(attendancePromises);
    const successCount = results.filter(result => result !== null).length;

    return NextResponse.json({ 
      message: "Attendance saved successfully",
      recordsProcessed: successCount,
      totalStudents: Object.keys(attendance).length
    });
  } catch (error) {
    console.error("[ATTENDANCE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const teacherId = searchParams.get("teacherId");

    if (!date || !teacherId) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    // Get existing attendance for the date
    const attendance = await db.attendance.findMany({
      where: {
        teacherId,
        date: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json({ attendance });
  } catch (error) {
    console.error("[ATTENDANCE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};