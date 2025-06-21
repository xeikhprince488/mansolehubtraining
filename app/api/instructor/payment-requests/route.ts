import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const GET = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all payment requests for courses created by this instructor
    const paymentRequests = await db.manualPaymentRequest.findMany({
      include: {
        course: {
          select: {
            title: true,
            price: true,
            instructorId: true
          }
        }
      },
      where: {
        course: {
          instructorId: userId
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(paymentRequests);
  } catch (error) {
    console.error("[PAYMENT_REQUESTS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};