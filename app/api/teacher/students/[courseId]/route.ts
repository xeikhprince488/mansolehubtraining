import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all students enrolled in the course
    const enrollments = await db.purchase.findMany({
      where: {
        courseId: params.courseId,
      },
      select: {
        customerId: true,
      },
    });

    // Get student details from Clerk
    const students = [];
    const clerk = await clerkClient();
    
    for (const enrollment of enrollments) {
      try {
        const user = await clerk.users.getUser(enrollment.customerId);
        students.push({
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName,
          lastName: user.lastName,
        });
      } catch (error) {
        console.error(`Failed to fetch user ${enrollment.customerId}:`, error);
      }
    }

    return NextResponse.json({ students });
  } catch (error) {
    console.error("[STUDENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};