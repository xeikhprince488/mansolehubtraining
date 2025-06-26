import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { userId: string; sectionId: string } }
) => {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId, sectionId } = params;

    // Ensure user can only access their own progress
    if (authUserId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const progress = await db.progress.findUnique({
      where: {
        studentId_sectionId: {
          studentId: userId,
          sectionId,
        },
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("[PROGRESS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};