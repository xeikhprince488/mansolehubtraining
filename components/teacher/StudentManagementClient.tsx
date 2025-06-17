"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Edit, TrendingUp, Calendar, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Student {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  class?: string | null;
  section?: string | null;
  age?: number | null;
  rollNumber?: string | null;
  isActive: boolean;
  attendanceRate: number;
  totalAttendance: number;
  presentCount: number;
  attendances: any[];
}

interface StudentManagementClientProps {
  students: Student[];
  teacherId: string;
  assignedClass?: string | null;
  assignedSection?: string | null;
}

const StudentManagementClient = ({ 
  students, 
  teacherId, 
  assignedClass, 
  assignedSection 
}: StudentManagementClientProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    (student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return "text-green-600 bg-green-100";
    if (rate >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search students by name, email, or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl border-2 border-slate-200/60"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {student.firstName?.[0] || student.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {student.firstName} {student.lastName}
                    </h3>
                    {student.rollNumber && (
                      <p className="text-sm text-slate-600">Roll: {student.rollNumber}</p>
                    )}
                    <p className="text-sm text-slate-600">{student.email}</p>
                  </div>
                </div>
                <Badge 
                  className={`${getAttendanceColor(student.attendanceRate)} border-0`}
                >
                  {student.attendanceRate}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-500">Age</div>
                  <div className="font-medium">{student.age || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Total Days</div>
                  <div className="font-medium">{student.totalAttendance}</div>
                </div>
                <div>
                  <div className="text-slate-500">Present</div>
                  <div className="font-medium text-green-600">{student.presentCount}</div>
                </div>
                <div>
                  <div className="text-slate-500">Absent</div>
                  <div className="font-medium text-red-600">
                    {student.totalAttendance - student.presentCount}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {selectedStudent?.firstName} {selectedStudent?.lastName}
                        {selectedStudent?.rollNumber && (
                          <span className="text-sm font-normal text-slate-600">
                            (Roll: {selectedStudent.rollNumber})
                          </span>
                        )}
                      </DialogTitle>
                    </DialogHeader>
                    {selectedStudent && (
                      <div className="space-y-6">
                        {/* Student Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-slate-600">Email</label>
                            <p className="text-slate-800">{selectedStudent.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600">Age</label>
                            <p className="text-slate-800">{selectedStudent.age || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600">Class</label>
                            <p className="text-slate-800">{selectedStudent.class}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600">Section</label>
                            <p className="text-slate-800">{selectedStudent.section}</p>
                          </div>
                          {selectedStudent.rollNumber && (
                            <div>
                              <label className="text-sm font-medium text-slate-600">Roll Number</label>
                              <p className="text-slate-800">{selectedStudent.rollNumber}</p>
                            </div>
                          )}
                        </div>

                        {/* Attendance Stats */}
                        <div className="bg-slate-50 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Attendance Statistics
                          </h4>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-slate-800">
                                {selectedStudent.attendanceRate}%
                              </div>
                              <div className="text-sm text-slate-600">Attendance Rate</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600">
                                {selectedStudent.presentCount}
                              </div>
                              <div className="text-sm text-slate-600">Days Present</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-red-600">
                                {selectedStudent.totalAttendance - selectedStudent.presentCount}
                              </div>
                              <div className="text-sm text-slate-600">Days Absent</div>
                            </div>
                          </div>
                        </div>

                        {/* Recent Attendance */}
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Recent Attendance (Last 10 days)
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedStudent.attendances.slice(0, 10).map((attendance, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                <span className="text-sm text-slate-600">
                                  {new Date(attendance.date).toLocaleDateString()}
                                </span>
                                <Badge 
                                  className={attendance.isPresent ? 
                                    "bg-green-100 text-green-800" : 
                                    "bg-red-100 text-red-800"
                                  }
                                >
                                  {attendance.isPresent ? 'Present' : 'Absent'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {students.length === 0 ? "No students assigned" : "No students match your search"}
            </h3>
            <p className="text-slate-600">
              {students.length === 0 
                ? "No students are assigned to your class and section yet."
                : "Try adjusting your search criteria."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentManagementClient;