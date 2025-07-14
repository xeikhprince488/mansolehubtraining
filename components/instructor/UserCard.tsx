"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface SerializedUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  emailAddress: string | null;
  role: string;
  createdAt: number;
}

const getRoleStyle = (role: string) => {
  switch (role.toLowerCase()) {
    case 'instructor':
      return { bg: 'bg-purple-100', text: 'text-purple-800' };
    case 'teacher':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'student':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
};

export default function UserCard({ user }: { user: SerializedUser }) {
  const roleStyle = getRoleStyle(user.role);

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <Avatar className="h-16 w-16 border-2 border-blue-500">
          <AvatarImage src={user.imageUrl || undefined} alt={user.firstName || "User"} />
          <AvatarFallback>{user.firstName?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {user.firstName || ""} {user.lastName || ""}
          </h3>
          <p className="text-sm text-gray-500">{user.emailAddress}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`px-2 py-1 ${roleStyle.bg} ${roleStyle.text} text-xs rounded-full`}>
              {user.role}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Active
            </span>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Card>
  );
}
