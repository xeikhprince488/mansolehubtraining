import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { sectionId: string } }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { sectionId } = params;

    const section = await db.section.findUnique({
      where: {
        id: sectionId,
      },
      include: {
        resources: true,
        course: true,
      },
    });

    if (!section) {
      return new NextResponse("Section Not Found", { status: 404 });
    }

    // If section is free, return resources immediately
    if (section.isFree) {
      return NextResponse.json(section.resources);
    }

    // For paid sections, get user email and check purchase
    const { currentUser } = await import("@clerk/nextjs/server");
    const user = await currentUser();
    
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse("User email not found", { status: 400 });
    }

    const customerEmail = user.emailAddresses[0].emailAddress;

    const purchase = await db.purchase.findUnique({
      where: {
        customerEmail_courseId: {
          customerEmail: customerEmail,
          courseId: section.courseId,
        },
      },
    });

    // If section is not free and user hasn't purchased, deny access
    if (!purchase) {
      return new NextResponse("Access Denied", { status: 403 });
    }

    return NextResponse.json(section.resources);
  } catch (error) {
    console.error("[SECTION_RESOURCES_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};