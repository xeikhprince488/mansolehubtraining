import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string; sectionId: string } }
) => {
  try {
    const { userId } = await auth();
    const { 
      isCompleted, 
      watchTimeSeconds, 
      videoDurationSeconds, 
      watchPercentage, 
      lastWatchedPosition,
      lastWatchedAt 
    } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId, sectionId } = params;

    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return new NextResponse("Course Not Found", { status: 404 });
    }

    const section = await db.section.findUnique({
      where: {
        id: sectionId,
        courseId,
      },
    });

    if (!section) {
      return new NextResponse("Section Not Found", { status: 404 });
    }

    let progress = await db.progress.findUnique({
      where: {
        studentId_sectionId: {
          studentId: userId,
          sectionId,
        },
      },
    });

    const updateData: any = {
      isCompleted: isCompleted || false,
    };

    // Add video tracking data if provided
    if (watchTimeSeconds !== undefined) {
      updateData.watchTimeSeconds = Math.max(watchTimeSeconds, progress?.watchTimeSeconds || 0);
    }
    if (videoDurationSeconds !== undefined) {
      updateData.videoDurationSeconds = videoDurationSeconds;
    }
    if (watchPercentage !== undefined) {
      updateData.watchPercentage = Math.max(watchPercentage, progress?.watchPercentage || 0);
    }
    if (lastWatchedPosition !== undefined) {
      updateData.lastWatchedPosition = lastWatchedPosition;
    }
    if (lastWatchedAt) {
      updateData.lastWatchedAt = new Date(lastWatchedAt);
    }
    if (isCompleted && !progress?.completedAt) {
      updateData.completedAt = new Date();
    }

    if (progress) {
      progress = await db.progress.update({
        where: {
          studentId_sectionId: {
            studentId: userId,
            sectionId,
          },
        },
        data: updateData,
      });
    } else {
      progress = await db.progress.create({
        data: {
          studentId: userId,
          sectionId,
          ...updateData,
        },
      });
    }

    return NextResponse.json(progress, { status: 200 });
  } catch (err) {
    console.log("[sectionId_progress_POST]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
