import { NextRequest, NextResponse } from "next/server";
import { sendPaymentConfirmationEmail } from "@/lib/resend-email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "studentEmail",
      "studentName",
      "courseName",
      "coursePrice",
      "requestId",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.studentEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    console.log("Sending payment confirmation email to:", body.studentEmail);

    const result = await sendPaymentConfirmationEmail({
      studentEmail: body.studentEmail,
      studentName: body.studentName,
      courseName: body.courseName,
      coursePrice: body.coursePrice,
      fatherName: body.fatherName,
      phoneNumber: body.phoneNumber,
      whatsappNumber: body.whatsappNumber,
      cnicNumber: body.cnicNumber,
      dateOfBirth: body.dateOfBirth,
      address: body.address,
      city: body.city,
      qualification: body.qualification,
      occupation: body.occupation,
      notes: body.notes,
      requestId: body.requestId,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        messageId: result.messageId,
      });
    } else {
      console.error("Email sending failed:", result.error);
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
