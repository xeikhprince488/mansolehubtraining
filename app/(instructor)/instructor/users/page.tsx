import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Users from "@/components/instructor/Users";

// Define instructor emails
const instructorEmails = [
  'programmingworld488@gmail.com',
  'ceo@largifysolutions.com',
  'mansol.skp@gmail.com',
  'umarpia4@gmail.com',
  'nesticktech@gmail.com'
];

export default async function UsersPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  // Get the current user
  const clerk = await clerkClient();
  const currentUser = await clerk.users.getUser(userId);
  const userEmail = currentUser.emailAddresses[0]?.emailAddress;

  // Check if the current user is an instructor
  if (!userEmail || !instructorEmails.includes(userEmail)) {
    return redirect("/");
  }

  // Fetch all users
  const userResponse = await clerk.users.getUserList({
    limit: 100,
    orderBy: "-created_at",
  });

  // Fetch teachers from the database
  const teachers = await db.teacher.findMany({
    select: {
      email: true
    }
  });
  const teacherEmails = teachers.map(teacher => teacher.email);

  // Serialize the user data
  const serializedUsers = userResponse.data.map(user => {
    const userEmail = user.emailAddresses[0]?.emailAddress;
    let role = "Student";
    
    // Check if user is an instructor
    if (userEmail && instructorEmails.includes(userEmail)) {
      role = "Instructor";
    }
    // Check if user is a teacher
    else if (userEmail && teacherEmails.includes(userEmail)) {
      role = "Teacher";
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      emailAddress: userEmail || null,
      role: role,
      createdAt: new Date(user.createdAt).getTime()
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto py-8">
        <Users initialUsers={serializedUsers} />
      </div>
    </div>
  );
}
