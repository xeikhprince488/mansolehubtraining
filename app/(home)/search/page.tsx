import CourseCard from "@/components/courses/CourseCard";
import { db } from "@/lib/db"
import { Search, BookOpen, Filter, Grid, List, TrendingUp } from "lucide-react";

const SearchPage = async ({ searchParams }: { searchParams: { query: string }}) => {
  const queryText = searchParams.query || ''
  const courses = await db.course.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: queryText } },
        { category: { name: { contains: queryText } }},
        { subCategory: { name: { contains: queryText } }}
      ]
    },
    include: {
      category: true,
      subCategory: true,
      level: true,
      sections: {
        where: {
          isPublished: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const totalResults = courses.length;
  const categories = Array.from(new Set(courses.map(course => course.category?.name).filter(Boolean)));
  const levels = Array.from(new Set(courses.map(course => course.level?.name).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Search Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm mb-6">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Search Results
            </h1>
            {queryText ? (
              <p className="text-xl text-blue-100 mb-8">
                Found <span className="font-semibold text-white">{totalResults}</span> courses for 
                <span className="font-semibold text-white"> {queryText}</span>
              </p>
            ) : (
              <p className="text-xl text-blue-100 mb-8">
                Discover amazing courses from our catalog
              </p>
            )}
            
            {/* Search Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm p-6 border border-white/20">
                <BookOpen className="h-8 w-8 mx-auto mb-3 text-blue-200" />
                <div className="text-2xl font-bold mb-1">{totalResults}</div>
                <div className="text-blue-200">Courses Found</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 border border-white/20">
                <Filter className="h-8 w-8 mx-auto mb-3 text-blue-200" />
                <div className="text-2xl font-bold mb-1">{categories.length}</div>
                <div className="text-blue-200">Categories</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 border border-white/20">
                <TrendingUp className="h-8 w-8 mx-auto mb-3 text-blue-200" />
                <div className="text-2xl font-bold mb-1">{levels.length}</div>
                <div className="text-blue-200">Skill Levels</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {totalResults > 0 ? (
          <>
            {/* Results Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {queryText ? `Results for "${queryText}"` : 'All Courses'}
                </h2>
                <p className="text-gray-600">
                  {totalResults} course{totalResults !== 1 ? 's' : ''} found
                </p>
              </div>
              
              {/* Filter Tags */}
              {(categories.length > 0 || levels.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                  {categories.slice(0, 3).map((category, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium border border-blue-200"
                    >
                      {category}
                    </span>
                  ))}
                  {levels.slice(0, 2).map((level, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium border border-indigo-200"
                    >
                      {level}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Search Insights */}
            {totalResults > 0 && (
              <div className="mt-16 bg-white shadow-lg border border-gray-100 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Search Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-700 mb-1">
                      {Math.round((totalResults / 50) * 100)}%
                    </div>
                    <div className="text-blue-600">Match Relevance</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 border border-green-100">
                    <div className="text-2xl font-bold text-green-700 mb-1">
                      {categories.length}
                    </div>
                    <div className="text-green-600">Categories Matched</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 border border-purple-100">
                    <div className="text-2xl font-bold text-purple-700 mb-1">
                      {levels.length}
                    </div>
                    <div className="text-purple-600">Skill Levels</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 border border-orange-100">
                    <div className="text-2xl font-bold text-orange-700 mb-1">
                      {courses.reduce((acc, course) => acc + course.sections.length, 0)}
                    </div>
                    <div className="text-orange-600">Total Lessons</div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 w-32 h-32 flex items-center justify-center mx-auto mb-8 border border-gray-200">
              <Search className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {queryText ? `No results found for "${queryText}"` : 'Start Your Search'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {queryText 
                ? 'Try adjusting your search terms or browse our categories to find what you\'re looking for.'
                : 'Use the search bar above to find courses that match your interests.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Browse All Courses
              </a>
              <a 
                href="/categories" 
                className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-semibold border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Grid className="h-5 w-5 mr-2" />
                View Categories
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage