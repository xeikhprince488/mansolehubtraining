import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const GET = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const user = await currentUser();

    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const customerEmail = user.emailAddresses[0].emailAddress;

    const purchase = await db.purchase.findUnique({
      where: {
        customerEmail_courseId: {
          customerEmail: customerEmail,
          courseId: params.courseId,
        },
      },
    });

    return NextResponse.json({
      hasPurchase: !!purchase,
      purchase: purchase
    });
  } catch (error) {
    console.error("[PURCHASE_STATUS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};