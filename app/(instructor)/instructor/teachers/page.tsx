"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { Plus, Users, UserCheck, UserX, Search, Filter, X } from "lucide-react";
import Link from "next/link";
// import { auth } from "@clerk/nextjs/server";
import { useAuth } from "@clerk/nextjs";

import { db } from "@/lib/db";
import { DataTable } from "@/components/custom/DataTable";
import { teacherColumns } from "@/components/admin/TeacherColumns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
// import { useAuth } from "@clerk/nextjs";

interface Teacher {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  assignedClass: string | null;
  assignedSection: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface TeachersPageProps {
  teachers: Teacher[];
}

const TeachersPageClient = ({ teachers: initialTeachers }: TeachersPageProps) => {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>(initialTeachers);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // ... existing code ...

// Get unique values for filter options
const uniqueClasses = Array.from(new Set(teachers.map(t => t.assignedClass).filter(Boolean)));
const uniqueSections = Array.from(new Set(teachers.map(t => t.assignedSection).filter(Boolean)));

// ... existing code ...
  // Filter teachers based on all criteria
  useEffect(() => {
    let filtered = teachers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(teacher => 
        (teacher.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (teacher.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Class filter
    if (classFilter !== "all") {
      filtered = filtered.filter(teacher => teacher.assignedClass === classFilter);
    }

    // Section filter
    if (sectionFilter !== "all") {
      filtered = filtered.filter(teacher => teacher.assignedSection === sectionFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(teacher => 
        statusFilter === "active" ? teacher.isActive : !teacher.isActive
      );
    }

    setFilteredTeachers(filtered);
  }, [teachers, searchTerm, classFilter, sectionFilter, statusFilter]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setClassFilter("all");
    setSectionFilter("all");
    setStatusFilter("all");
  };

  const activeFiltersCount = [
    searchTerm,
    classFilter !== "all" ? classFilter : null,
    sectionFilter !== "all" ? sectionFilter : null,
    statusFilter !== "all" ? statusFilter : null
  ].filter(Boolean).length;

  const activeTeachers = filteredTeachers.filter(teacher => teacher.isActive);
  const inactiveTeachers = filteredTeachers.filter(teacher => !teacher.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Teacher Management</h1>
              <p className="text-blue-100 mt-1">Manage teachers and their access permissions</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-lg mb-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{filteredTeachers.length}</div>
              <div className="text-blue-100 text-sm">Total Teachers</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-lg mb-3">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{activeTeachers.length}</div>
              <div className="text-blue-100 text-sm">Active</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-red-500/20 rounded-lg mb-3">
                <UserX className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{inactiveTeachers.length}</div>
              <div className="text-blue-100 text-sm">Inactive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Teacher Directory</h2>
            <p className="text-slate-600">Add and manage teacher accounts</p>
          </div>
          
          <Link 
            href="/instructor/teachers/add"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 inline-flex"
          >
            <Plus className="h-5 w-5" />
            Add Teacher
          </Link>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-800">Filters & Search</h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {activeFiltersCount} active
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-slate-600 hover:text-slate-800"
              >
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search teachers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-gradient-to-r from-slate-50 to-blue-50/30 border-2 border-slate-200/60 hover:border-blue-300/60 focus:border-blue-500/60 rounded-xl"
              />
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Class</label>
                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="h-11 rounded-xl border-2 border-slate-200/60">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {uniqueClasses.map(cls => (
                        <SelectItem key={cls} value={cls!}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Section</label>
                  <Select value={sectionFilter} onValueChange={setSectionFilter}>
                    <SelectTrigger className="h-11 rounded-xl border-2 border-slate-200/60">
                      <SelectValue placeholder="All Sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {uniqueSections.map(section => (
                        <SelectItem key={section} value={section!}>{section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-11 rounded-xl border-2 border-slate-200/60">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Active Filters & Clear */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-slate-600">Active filters:</span>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Search: {searchTerm}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                    </Badge>
                  )}
                  {classFilter !== "all" && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Class: {classFilter}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setClassFilter("all")} />
                    </Badge>
                  )}
                  {sectionFilter !== "all" && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Section: {sectionFilter}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSectionFilter("all")} />
                    </Badge>
                  )}
                  {statusFilter !== "all" && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Status: {statusFilter}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">All Teachers</h3>
            <p className="text-slate-600 text-sm mt-1">Manage teacher accounts and permissions</p>
          </div>
          
          <div className="p-6">
            {filteredTeachers.length > 0 ? (
              <DataTable 
                columns={teacherColumns} 
                data={filteredTeachers}
                searchPlaceholder="Search teachers..."
                searchColumn="firstName"
              />
            ) : (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {teachers.length === 0 ? "No teachers yet" : "No teachers match your filters"}
                </h3>
                <p className="text-slate-600 mb-6">
                  {teachers.length === 0 ? "Start by adding your first teacher" : "Try adjusting your search criteria"}
                </p>
                {teachers.length === 0 ? (
                  <Link 
                    href="/instructor/teachers/add"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Add First Teacher
                  </Link>
                ) : (
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TeachersPage = () => {
  const { userId } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!userId) {
        redirect("/sign-in");
        return;
      }

      try {
        const response = await fetch(`/api/teachers?userId=${userId}`);
        const teachersData = await response.json();
        setTeachers(teachersData);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          {/* Animated spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          
          {/* Loading text with animation */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800 animate-pulse">
              Loading Teachers
            </h3>
            <p className="text-slate-600 animate-pulse">
              Please wait while we fetch the teacher data...
            </p>
          </div>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return <TeachersPageClient teachers={teachers} />;
};

export default TeachersPage;