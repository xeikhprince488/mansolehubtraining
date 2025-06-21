import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const POST = async (
  req: NextRequest,
  { params }: { params: { requestId: string } }
) => {
  try {
    const { userId } = await auth();
    const { reason } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update payment request status
    await db.manualPaymentRequest.update({
      where: { id: params.requestId },
      data: {
        status: "rejected",
        rejectionReason: reason,
        approvedBy: userId
      }
    });

    return NextResponse.json({ message: "Payment request rejected" });
  } catch (error) {
    console.error("[REJECT_PAYMENT_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};