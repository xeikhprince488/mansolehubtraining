import getCoursesByCategory from "@/app/actions/getCourses";
import CourseCard from "@/components/courses/CourseCard";
import Categories from "@/components/custom/Categories";
import { db } from "@/lib/db";
import { BookOpen, Filter, Grid3X3 } from "lucide-react";

const CoursesByCategory = async ({
  params,
}: {
  params: { categoryId: string };
}) => {
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const courses = await getCoursesByCategory(params.categoryId);

  // Get the selected category name
  const selectedCategoryName = categories.find(
    (cat) => cat.id === params.categoryId
  )?.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">
              {selectedCategoryName ? `${selectedCategoryName} Courses` : "All Courses"}
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover amazing courses and expand your knowledge with our expert instructors
          </p>
        </div>

        {/* Categories Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Filter className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Filter by Category</h2>
          </div>
          <Categories categories={categories} selectedCategory={params.categoryId} />
        </div>

        {/* Courses Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Grid3X3 className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Available Courses ({courses.length})
              </h2>
            </div>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="p-4 bg-slate-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No Courses Found
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                {selectedCategoryName 
                  ? `No courses available in the ${selectedCategoryName} category yet. Check back soon!`
                  : "No courses available yet. Check back soon for new content!"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesByCategory;
