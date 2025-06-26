import { db } from "@/lib/db";
import { Resource } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import DeviceAccessWrapper from "@/components/custom/DeviceAccessWrapper";
import SectionsDetails from "@/components/sections/SectionsDetails";

const SectionDetailsPage = async ({
  params,
}: {
  params: { courseId: string; sectionId: string };
}) => {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
    return redirect("/sign-in");
  }

  const customerEmail = user.emailAddresses[0].emailAddress;
  const { courseId, sectionId } = params;

  const course = await db.course.findUnique({
    where: {
      id: courseId,
      isPublished: true,
    },
    include: {
      sections: {
        where: {
          isPublished: true,
        },
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  const section = await db.section.findUnique({
    where: {
      id: sectionId,
      courseId,
      isPublished: true,
    },
  });

  if (!section) {
    return redirect(`/courses/${courseId}/overview`);
  }

  const purchase = await db.purchase.findUnique({
    where: {
      customerEmail_courseId: {
        customerEmail: customerEmail,
        courseId: params.courseId,
      },
    },
  });

  // For free sections, no device restriction
  if (section.isFree) {
    const muxData = await db.muxData.findUnique({
      where: {
        sectionId,
      },
    });

    const progress = await db.progress.findUnique({
      where: {
        studentId_sectionId: {
          studentId: userId,
          sectionId,
        },
      },
    });

    const resources = await db.resource.findMany({
      where: {
        sectionId,
      },
    });

    return (
      <SectionsDetails
        course={course}
        section={section}
        purchase={purchase}
        muxData={muxData}
        resources={resources}
        progress={progress}
      />
    );
  }

  // For paid sections, get additional data and use device access guard
  const muxData = purchase ? await db.muxData.findUnique({
    where: {
      sectionId,
    },
  }) : null;

  const resources = purchase ? await db.resource.findMany({
    where: {
      sectionId,
    },
  }) : [];

  const progress = await db.progress.findUnique({
    where: {
      studentId_sectionId: {
        studentId: userId,
        sectionId,
      },
    },
  });

  return (
    <DeviceAccessWrapper
      courseId={courseId}
      courseName={course.title}
      purchase={purchase}
      course={course}
      section={section}
      userId={userId}
      sectionId={sectionId}
    />
  );
};

export default SectionDetailsPage;
