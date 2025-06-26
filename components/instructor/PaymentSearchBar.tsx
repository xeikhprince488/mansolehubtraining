"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCallback } from "react";

interface PaymentSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  courses?: { id: string; title: string }[];
}

interface SearchFilters {
  searchTerm: string;
  status: string;
  courseId: string;
}

const PaymentSearchBar = ({ onSearch, courses = [] }: PaymentSearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [courseId, setCourseId] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch({ searchTerm, status, courseId });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, status, courseId, onSearch]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatus("");
    setCourseId("");
  };

  const activeFiltersCount = [status, courseId].filter(filter => filter && filter !== "all").length;

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-200">
      <div className="max-w-4xl mx-auto">
        {/* Main Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by student name, email, course title, or payment details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-sm bg-white border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:shadow-md"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="relative px-4 py-3 bg-white border-slate-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              {/* Status Filter */}
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Status
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full bg-white border-slate-300 rounded-lg">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="approved">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Approved
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Rejected
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Course Filter */}
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Course
                </label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger className="w-full bg-white border-slate-300 rounded-lg">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(searchTerm || status || courseId) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                Search: &quot;{searchTerm}&quot;
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-2 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {status && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                Status: {status}
                <button
                  onClick={() => setStatus("")}
                  className="ml-2 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {courseId && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1">
                Course: {courses.find(c => c.id === courseId)?.title || courseId}
                <button
                  onClick={() => setCourseId("")}
                  className="ml-2 hover:text-purple-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSearchBar;