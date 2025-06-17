import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";

import AddTeacherForm from "@/components/admin/AddTeacherForm";

const AddTeacherPage = async () => {
  const { userId } = await auth();


  if (!userId) {
    return redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Add New Teacher</h1>
              <p className="text-blue-100 mt-1">Create a new teacher account with access permissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Teacher Information</h2>
            <p className="text-slate-600 text-sm mt-1">Enter the teacher&apos;s details to create their account</p>
          </div>
          
          <div className="p-6">
            <AddTeacherForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTeacherPage;