import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import Topbar from "@/components/layout/Topbar";
import TeacherSidebar from "@/components/layout/TeacherSidebar";
import StreamVideoProvider from "@/components/providers/StreamVideoProvider";
import { db } from "@/lib/db";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();


  if (!userId) {
    return redirect("/sign-in");
  }

  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  if (!userEmail) {
    return redirect("/");
  }

  // Check if user is an authorized teacher
  const teacher = await db.teacher.findFirst({
    where: {
      email: userEmail,
      isActive: true,
    },
  });

  if (!teacher) {
    return redirect("/");
  }

  return (
    <StreamVideoProvider>
      <div className="h-full">
        <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50">
          <Topbar />
        </div>
        <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
          <TeacherSidebar />
        </div>
        <main className="md:pl-56 pt-[80px] h-full">
          {children}
          <Analytics />
          <SpeedInsights />
          </main>
      </div>
    </StreamVideoProvider>
  );
}