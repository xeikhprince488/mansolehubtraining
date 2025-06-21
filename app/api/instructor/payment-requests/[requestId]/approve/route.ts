import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: { requestId: string } }
) => {
  try {
    const { userId } = await auth();
    const { courseId, studentEmail } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify the instructor owns this course
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        instructorId: userId
      }
    });

    if (!course) {
      return new NextResponse("Course not found or unauthorized", { status: 404 });
    }

    // Get the payment request
    const paymentRequest = await db.manualPaymentRequest.findUnique({
      where: { id: params.requestId }
    });

    if (!paymentRequest) {
      return new NextResponse("Payment request not found", { status: 404 });
    }

    // Find or create student record
    let studentRecord = await db.student.findFirst({
      where: {
        email: studentEmail
      }
    });

    if (!studentRecord) {
      // If no Student record exists, find the Clerk user ID and create one
      const { clerkClient } = await import('@clerk/nextjs/server');
      
      try {
        const client = await clerkClient();
        const usersResponse = await client.users.getUserList({
          emailAddress: [studentEmail]
        });
        
        if (usersResponse.data && usersResponse.data.length > 0) {
          const clerkUser = usersResponse.data[0];
          
          // Create Student record
          studentRecord = await db.student.create({
            data: {
              userId: clerkUser.id,
              email: studentEmail,
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
              addedById: userId
            }
          });
        }
      } catch (clerkError) {
        console.error("Error finding user in Clerk:", clerkError);
      }
    }

    console.log("Creating purchase with:", {
      customerEmail: studentEmail,
      courseId: courseId,
      studentId: studentRecord?.id
    });

    // Check if purchase already exists
    const existingPurchase = await db.purchase.findUnique({
      where: {
        customerEmail_courseId: {
          customerEmail: studentEmail,
          courseId: courseId
        }
      }
    });

    if (existingPurchase) {
      // Update payment request status
      await db.manualPaymentRequest.update({
        where: { id: params.requestId },
        data: {
          status: "approved",
          approvedBy: userId
        }
      });
      
      return NextResponse.json({ 
        message: "Payment approved - student already has access",
        shouldRefresh: true 
      });
    }

    // Update payment request status
    await db.manualPaymentRequest.update({
      where: { id: params.requestId },
      data: {
        status: "approved",
        approvedBy: userId
      }
    });

    // Create purchase record
    const newPurchase = await db.purchase.create({
      data: {
        customerEmail: studentEmail, // Changed from customerId to customerEmail
        courseId: courseId,
        studentId: studentRecord?.id
      }
    });

    console.log("Purchase created:", newPurchase);

    return NextResponse.json({ 
      message: "Payment approved and course access granted successfully!",
      shouldRefresh: true,
      customerEmail: studentEmail
    });
  } catch (error) {
    console.error("[APPROVE_PAYMENT_REQUEST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};