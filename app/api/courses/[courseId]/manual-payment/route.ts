import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const formData = await req.formData();
    const studentEmail = formData.get("studentEmail") as string;
    const studentName = formData.get("studentName") as string;
    const fatherName = formData.get("fatherName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const whatsappNumber = formData.get("whatsappNumber") as string;
    const cnicNumber = formData.get("cnicNumber") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const qualification = formData.get("qualification") as string;
    const occupation = formData.get("occupation") as string;
    const courseId = formData.get("courseId") as string;
    const bankDetails = formData.get("bankDetails") as string;
    const transactionImage = formData.get("transactionImage") as File;

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

    // Create transactions directory if it doesn't exist
    const transactionsDir = join(process.cwd(), "public", "transactions");
    if (!existsSync(transactionsDir)) {
      await mkdir(transactionsDir, { recursive: true });
    }

    // Save the uploaded image
    const bytes = await transactionImage.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileName = `transaction_${Date.now()}_${transactionImage.name}`;
    const filePath = join(transactionsDir, fileName);
    
    await writeFile(filePath, buffer);
    const imageUrl = `/transactions/${fileName}`;

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
        transactionImage: imageUrl,
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