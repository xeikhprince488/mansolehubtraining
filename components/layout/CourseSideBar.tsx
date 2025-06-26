import { db } from "@/lib/db";
import { Course, Section } from "@prisma/client";
import { CourseSideBarClient } from "./CourseSideBarClient";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface CourseSideBarProps {
  course: Course & { sections: Section[] };
  studentId: string;
}

const CourseSideBar = async ({ course, studentId }: CourseSideBarProps) => {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
    return redirect("/");
  }

  const customerEmail = user.emailAddresses[0].emailAddress;

  // Check for purchase using email-based system
  const purchase = await db.purchase.findUnique({
    where: {
      customerEmail_courseId: {
        customerEmail: customerEmail,
        courseId: course.id,
      },
    },
  });

  const publishedSections = await db.section.findMany({
    where: {
      courseId: course.id,
      isPublished: true,
    },
    orderBy: {
      position: "asc",
    },
  });

  const publishedSectionIds = publishedSections.map((section) => section.id);

  // Get individual progress for each section
  const sectionProgress = await db.progress.findMany({
    where: {
      studentId,
      sectionId: {
        in: publishedSectionIds,
      },
    },
    select: {
      sectionId: true,
      isCompleted: true,
    },
  });

  // Create a map of section completion status
  const progressMap = new Map(
    sectionProgress.map((progress) => [progress.sectionId, progress.isCompleted])
  );

  const completedSections = sectionProgress.filter((progress) => progress.isCompleted).length;

  const progressPercentage = publishedSectionIds.length > 0 
    ? (completedSections / publishedSectionIds.length) * 100 
    : 0;

  return (
    <CourseSideBarClient 
      course={course}
      publishedSections={publishedSections}
      completedSections={completedSections}
      purchase={purchase}
      progressPercentage={progressPercentage}
      progressMap={progressMap}
    />
  );
};

export default CourseSideBar;