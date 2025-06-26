import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerDeviceInfo } from "@/lib/deviceFingerprint";

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
      deviceInfo
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

    // Create payment request with all fields including device info
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
        deviceInfo: deviceInfo ? JSON.parse(deviceInfo) : null
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