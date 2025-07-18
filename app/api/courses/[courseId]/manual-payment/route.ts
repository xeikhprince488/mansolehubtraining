import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerDeviceInfo } from "@/lib/deviceFingerprint";
// Remove the email import since we're using client-side EmailJS now

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const body = await req.json();
    const {
      studentEmail,
      studentName,
      fatherName,
      phoneNumber,
      whatsappNumber,
      cnicNumber,
      dateOfBirth,
      address,
      city,
      qualification,
      occupation,
      courseId,
      bankDetails,
      transactionImage,
      deviceFingerprint,
      deviceInfo,
      notes
    } = body;

    if (!studentEmail || !studentName || !phoneNumber || !courseId || !transactionImage) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get server-side device info
    const serverDeviceInfo = getServerDeviceInfo(req);

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: courseId, isPublished: true },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Check if user already purchased the course
    const existingPurchase = await db.purchase.findUnique({
      where: {
        customerEmail_courseId: {
          customerEmail: studentEmail,
          courseId: courseId,
        },
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { 
          error: "ALREADY_PURCHASED",
          message: "You have already purchased this course! You can access it from your dashboard.",
          redirectUrl: `/courses/${courseId}/sections`
        }, 
        { status: 409 }
      );
    }

    // Check if payment request already exists and is pending
    const existingRequest = await db.manualPaymentRequest.findFirst({
      where: {
        studentEmail,
        courseId,
        status: "pending"
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { 
          error: "PENDING_APPROVAL",
          message: "You already have a pending payment request for this course. Please wait for approval.",
          submittedAt: existingRequest.createdAt,
          requestId: existingRequest.id
        }, 
        { status: 409 }
      );
    }

    // Check if there's a rejected request (allow resubmission)
    const rejectedRequest = await db.manualPaymentRequest.findFirst({
      where: {
        studentEmail,
        courseId,
        status: "rejected"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (rejectedRequest) {
      console.log(`User ${studentEmail} resubmitting after rejection for course ${courseId}`);
    }

    // Create payment request with all fields including notes
    const paymentRequest = await db.manualPaymentRequest.create({
      data: {
        studentEmail,
        studentName,
        fatherName: fatherName || null,
        phoneNumber,
        whatsappNumber: whatsappNumber || null,
        cnicNumber: cnicNumber || null,
        dateOfBirth: dateOfBirth || null,
        address: address || null,
        city: city || null,
        qualification: qualification || null,
        occupation: occupation || null,
        courseId,
        transactionImage,
        bankDetails,
        status: "pending",
        deviceFingerprint: deviceFingerprint || null,
        deviceInfo: deviceInfo ? JSON.parse(deviceInfo) : null,
        notes: notes || null
      }
    });

    // Email sending is now handled on the client-side using EmailJS
    console.log('Payment request created successfully, email will be sent from client-side');

    return NextResponse.json({ 
      message: "Payment request submitted successfully",
      requestId: paymentRequest.id 
    });
  } catch (error) {
    console.error("[MANUAL_PAYMENT_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};