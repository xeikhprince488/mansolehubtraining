import EditCourseForm from "@/components/courses/EditCourseForm";
import AlertBanner from "@/components/custom/AlertBanner";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Settings, CheckCircle, AlertCircle, BookOpen } from "lucide-react";

const CourseBasics = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      instructorId: userId,
    },
    include: {
      sections: true,
    },
  });

  if (!course) {
    return redirect("/instructor/courses");
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      subCategories: true,
    },
  });

  const levels = await db.level.findMany();

  const requiredFields = [
    course.title,
    course.description,
    course.categoryId,
    course.subCategoryId,
    course.levelId,
    course.imageUrl,
    course.price,
    course.sections.some((section) => section.isPublished),
  ];
  const requiredFieldsCount = requiredFields.length;
  const missingFields = requiredFields.filter((field) => !Boolean(field));
  const missingFieldsCount = missingFields.length;
  const isCompleted = requiredFields.every(Boolean);
  const completionPercentage = Math.round(((requiredFieldsCount - missingFieldsCount) / requiredFieldsCount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Course Settings</h1>
              <p className="text-blue-100 mt-1">Configure your course basic information</p>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Course Completion</span>
              <span className="text-sm font-bold">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {isCompleted ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-100">Course is ready to publish!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-100">{missingFieldsCount} field(s) remaining</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alert Banner */}
        <div className="mb-8">
          <AlertBanner
            isCompleted={isCompleted}
            missingFieldsCount={missingFieldsCount}
            requiredFieldsCount={requiredFieldsCount}
          />
        </div>

        {/* Course Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Course Information</h2>
                <p className="text-slate-600 text-sm">Fill in the details to create an engaging course</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <EditCourseForm
              course={course}
              categories={categories.map((category) => ({
                label: category.name,
                value: category.id,
                subCategories: category.subCategories.map((subcategory) => ({
                  label: subcategory.name,
                  value: subcategory.id,
                })),
              }))}
              levels={levels.map((level) => ({
                label: level.name,
                value: level.id,
              }))}
              isCompleted={isCompleted}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBasics;
