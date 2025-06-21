import SectionsDetails from "@/components/sections/SectionsDetails";
import { db } from "@/lib/db";
import { Resource } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

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

  console.log("Current user ID:", userId);
  console.log("Customer email:", customerEmail);
  console.log("Course ID:", params.courseId);

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

  console.log("Found purchase:", purchase);

  let muxData = null;
  let resources: Resource[] = [];

  if (section.isFree || purchase) {
    muxData = await db.muxData.findUnique({
      where: {
        sectionId,
      },
    });
  }

  if (purchase) {
    resources = await db.resource.findMany({
      where: {
        sectionId,
      },
    });
  }

  const progress = await db.progress.findUnique({
    where: {
      studentId_sectionId: {
        studentId: userId,
        sectionId,
      },
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
};

export default SectionDetailsPage;
