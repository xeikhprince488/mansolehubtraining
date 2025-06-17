"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { Plus, GraduationCap, UserCheck, UserX, Search, Filter, X } from "lucide-react";
import Link from "next/link";
// import { auth } from "@clerk/nextjs/server";
import { useAuth } from "@clerk/nextjs";

import { db } from "@/lib/db";
import { DataTable } from "@/components/custom/DataTable";
import { studentColumns } from "@/components/admin/StudentColumns";
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

interface Student {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  class: string | null;
  section: string | null;
  age: number | null;
  isActive: boolean;
  createdAt: Date;
  enrollments: any[];
}

interface StudentsPageProps {
  students: Student[];
}

const StudentsPageClient = ({ students: initialStudents }: StudentsPageProps) => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filter options
  const uniqueClasses = Array.from(new Set(students.map(s => s.class).filter(Boolean)));
  const uniqueSections = Array.from(new Set(students.map(s => s.section).filter(Boolean)));
  const ageRanges = [
    { label: "Under 18", value: "under18" },
    { label: "18-25", value: "18-25" },
    { label: "26-35", value: "26-35" },
    { label: "36-50", value: "36-50" },
    { label: "Over 50", value: "over50" }
  ];

  // Filter students based on all criteria
  useEffect(() => {
    let filtered = students;

    // Search filter
      if (searchTerm) {
      filtered = filtered.filter(student => 
        (student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Class filter
    if (classFilter !== "all") {
      filtered = filtered.filter(student => student.class === classFilter);
    }

    // Section filter
    if (sectionFilter !== "all") {
      filtered = filtered.filter(student => student.section === sectionFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(student => 
        statusFilter === "active" ? student.isActive : !student.isActive
      );
    }

    // Age filter
    if (ageFilter !== "all" && ageFilter) {
      filtered = filtered.filter(student => {
        if (!student.age) return false;
        switch (ageFilter) {
          case "under18": return student.age < 18;
          case "18-25": return student.age >= 18 && student.age <= 25;
          case "26-35": return student.age >= 26 && student.age <= 35;
          case "36-50": return student.age >= 36 && student.age <= 50;
          case "over50": return student.age > 50;
          default: return true;
        }
      });
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, classFilter, sectionFilter, statusFilter, ageFilter]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setClassFilter("all");
    setSectionFilter("all");
    setStatusFilter("all");
    setAgeFilter("all");
  };

  const activeFiltersCount = [
    searchTerm,
    classFilter !== "all" ? classFilter : null,
    sectionFilter !== "all" ? sectionFilter : null,
    statusFilter !== "all" ? statusFilter : null,
    ageFilter !== "all" ? ageFilter : null
  ].filter(Boolean).length;

  const activeStudents = filteredStudents.filter(student => student.isActive);
  const inactiveStudents = filteredStudents.filter(student => !student.isActive);
  const totalEnrollments = filteredStudents.reduce((acc, student) => acc + student.enrollments.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Student Management</h1>
              <p className="text-blue-100 mt-1">Manage student accounts and enrollments</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-lg mb-3">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{filteredStudents.length}</div>
              <div className="text-blue-100 text-sm">Total Students</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-lg mb-3">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{activeStudents.length}</div>
              <div className="text-blue-100 text-sm">Active</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-red-500/20 rounded-lg mb-3">
                <UserX className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{inactiveStudents.length}</div>
              <div className="text-blue-100 text-sm">Inactive</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-lg mb-3">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{totalEnrollments}</div>
              <div className="text-blue-100 text-sm">Enrollments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Student Directory</h2>
            <p className="text-slate-600">Add and manage student accounts</p>
          </div>
          
          <Link 
            href="/instructor/students/add"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 inline-flex"
          >
            <Plus className="h-5 w-5" />
            Add Student
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
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-gradient-to-r from-slate-50 to-blue-50/30 border-2 border-slate-200/60 hover:border-blue-300/60 focus:border-blue-500/60 rounded-xl"
              />
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Section</label>
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Age Range</label>
                  <Select value={ageFilter} onValueChange={setAgeFilter}>
                    <SelectTrigger className="h-11 rounded-xl border-2 border-slate-200/60">
                      <SelectValue placeholder="All Ages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      {ageRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                      ))}
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
                  {ageFilter !== "all" && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Age: {ageRanges.find(r => r.value === ageFilter)?.label}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setAgeFilter("all")} />
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

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">All Students</h3>
            <p className="text-slate-600 text-sm mt-1">Manage student accounts and enrollments</p>
          </div>
          
          <div className="p-6">
            {filteredStudents.length > 0 ? (
              <DataTable 
                columns={studentColumns} 
                data={filteredStudents}
                searchPlaceholder="Search students..."
                searchColumn="firstName"
              />
            ) : (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {students.length === 0 ? "No students yet" : "No students match your filters"}
                </h3>
                <p className="text-slate-600 mb-6">
                  {students.length === 0 ? "Start by adding your first student" : "Try adjusting your search criteria"}
                </p>
                {students.length === 0 ? (
                  <Link 
                    href="/instructor/students/add"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Add First Student
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

const StudentsPage = () => {
  const { userId } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!userId) {
        redirect("/sign-in");
        return;
      }

      try {
        const response = await fetch(`/api/students?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const studentsData = await response.json();
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return <StudentsPageClient students={students} />;
};

export default StudentsPage;