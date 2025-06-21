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
        customerEmail: true, // Changed from customerId to customerEmail
      },
    });

    // Get student details from Clerk using email addresses
    const students = [];
    const clerk = await clerkClient();
    
    for (const enrollment of enrollments) {
      try {
        // Find user by email address instead of user ID
        const users = await clerk.users.getUserList({
          emailAddress: [enrollment.customerEmail],
        });
        
        if (users.data.length > 0) {
          const user = users.data[0];
          students.push({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress || "",
            firstName: user.firstName,
            lastName: user.lastName,
          });
        }
      } catch (error) {
        console.error(`Failed to fetch user with email ${enrollment.customerEmail}:`, error);
      }
    }

    return NextResponse.json({ students });
  } catch (error) {
    console.error("[STUDENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};