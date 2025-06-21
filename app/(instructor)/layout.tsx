import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";

// Define instructor emails
const instructorEmails = [
   'programmingworld488@gmail.com',
  'ceo@largifysolutions.com',
  'mansol.skp@gmail.com',
  'umarpia4@gmail.com'
];

export default async function InstructorLayout({
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

  // Check if user is an instructor
  if (userEmail && instructorEmails.includes(userEmail)) {
    // User is an instructor, allow access with full layout
    return (
      <div className="h-full flex flex-col">
        <Topbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    );
  }

  // If not an instructor, check if they're a teacher
  if (userEmail) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/teachers`, {
        headers: {
          'Authorization': `Bearer ${userId}`,
        },
      });
      
      if (response.ok) {
        const teachers = await response.json();
        const isTeacher = teachers.some((teacher: any) => teacher.email === userEmail);
        
        if (isTeacher) {
          // Redirect to teacher dashboard
          return redirect('/teacher');
        }
      }
    } catch (error) {
      console.log('Error checking teacher status:', error);
    }
  }

  // If neither instructor nor teacher, redirect to home
  return redirect('/');
}
