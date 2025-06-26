import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { sectionId: string } }
) => {
  try {
    const user = await currentUser();

    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const customerEmail = user.emailAddresses[0].emailAddress;
    const { sectionId } = params;

    const section = await db.section.findUnique({
      where: {
        id: sectionId,
      },
      include: {
        muxData: true,
        course: true,
      },
    });

    if (!section) {
      return new NextResponse("Section Not Found", { status: 404 });
    }

    // Check if user has access to this section
    const purchase = await db.purchase.findUnique({
      where: {
        customerEmail_courseId: {
          customerEmail: customerEmail,
          courseId: section.courseId,
        },
      },
    });

    // If section is not free and user hasn't purchased, deny access
    if (!section.isFree && !purchase) {
      return new NextResponse("Access Denied", { status: 403 });
    }

    return NextResponse.json(section.muxData);
  } catch (error) {
    console.error("[SECTION_MUX_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};