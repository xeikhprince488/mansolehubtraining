import Topbar from "@/components/layout/Topbar";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CourseSideBar from "@/components/layout/CourseSideBar";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const CourseDetailsLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      sections: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  return (
    <div className="h-full flex flex-col">
      {/* <Topbar /> */}
      <div className="flex-1 flex">
        <CourseSideBar course={course} studentId={userId} />
        {/* Add left margin to account for fixed sidebar */}
        <div className="flex-1 md:ml-80">
          {children}
          <Analytics />
          <SpeedInsights />

        </div>
      </div>
    </div>
  );
};

export default CourseDetailsLayout;
