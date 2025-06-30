import { SignUp } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Define instructor emails
const instructorEmails = [
   'programmingworld488@gmail.com',
  'ceo@largifysolutions.com',
  'mansol.skp@gmail.com',
  'umarpia4@gmail.com',
   'nesticktech@gmail.com'
];

export default async function Page() {
  // Check if user is already authenticated
  const { userId } = await auth();
  
  if (userId) {
    // User is authenticated, check if they're an instructor
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    
    if (userEmail && instructorEmails.includes(userEmail)) {
      // Redirect instructor to instructor dashboard
      redirect('/instructor/courses');
    }
    
    // For non-instructors, redirect to home or appropriate page
    redirect('/');
  }
  
  // User is not authenticated, show sign-up form
  return <SignUp />;
}