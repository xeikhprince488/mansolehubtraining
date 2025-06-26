import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const body = await req.json(); // Changed from formData to JSON
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
      transactionImage // Now expecting URL string
    } = body;

    if (!studentEmail || !studentName || !phoneNumber || !courseId || !transactionImage) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: courseId, isPublished: true },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Check if payment request already exists
    const existingRequest = await db.manualPaymentRequest.findFirst({
      where: {
        studentEmail,
        courseId,
        status: "pending"
      }
    });

    if (existingRequest) {
      return new NextResponse("Payment request already exists", { status: 400 });
    }

    // Create payment request with all fields
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
        transactionImage, // Now storing the UploadThing URL directly
        bankDetails,
        status: "pending"
      }
    });

    return NextResponse.json({ 
      message: "Payment request submitted successfully",
      requestId: paymentRequest.id 
    });
  } catch (error) {
    console.error("[MANUAL_PAYMENT_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};