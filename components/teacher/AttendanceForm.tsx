"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { Calendar, Users, Save, Search, UserCheck, UserX, Clock } from "lucide-react";

interface Student {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  class?: string | null;
  section?: string | null;
  age?: number | null;
  rollNumber?: string | null; // Added rollNumber field
}

interface AttendanceFormProps {
  students: Student[];
  teacherId: string;
  assignedClass?: string | null;
  assignedSection?: string | null;
}

const AttendanceForm = ({ students, teacherId, assignedClass, assignedSection }: AttendanceFormProps) => {
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [existingAttendance, setExistingAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Initialize attendance state
  useEffect(() => {
    const initialAttendance: Record<string, boolean> = {};
    students.forEach((student) => {
      initialAttendance[student.id] = false;
    });
    setAttendance(initialAttendance);
  }, [students]);

  // Fetch existing attendance for selected date
  const fetchExistingAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/attendance?date=${selectedDate}&teacherId=${teacherId}`);
      if (response.ok) {
        const data = await response.json();
        const existingData: Record<string, boolean> = {};
        data.attendance.forEach((record: any) => {
          existingData[record.studentId] = record.isPresent;
        });
        setExistingAttendance(existingData);
        setAttendance(prev => ({ ...prev, ...existingData }));
      }
    } catch (error) {
      console.error("Failed to fetch existing attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, teacherId]);

  useEffect(() => {
    if (selectedDate && students.length > 0) {
      fetchExistingAttendance();
    }
  }, [selectedDate, students, fetchExistingAttendance]);

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: isPresent
    }));
  };

  const handleSelectAll = (isPresent: boolean) => {
    const newAttendance: Record<string, boolean> = {};
    filteredStudents.forEach(student => {
      newAttendance[student.id] = isPresent;
    });
    setAttendance(prev => ({ ...prev, ...newAttendance }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherId,
          date: selectedDate,
          attendance,
          assignedClass,
          assignedSection,
        }),
      });

      if (response.ok) {
        toast.success("Attendance saved successfully!");
        setExistingAttendance({ ...attendance });
      } else {
        toast.error("Failed to save attendance");
      }
    } catch (error) {
      toast.error("An error occurred while saving attendance");
    } finally {
      setSaving(false);
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    (student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="space-y-6">
      {/* Controls Card */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800">
            <Calendar className="h-5 w-5" />
            Attendance Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-11 rounded-xl border-2 border-slate-200/60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Students
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-2 border-slate-200/60"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={() => handleSelectAll(true)}
              variant="outline"
              size="sm"
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Mark All Present
            </Button>
            <Button
              onClick={() => handleSelectAll(false)}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <UserX className="h-4 w-4 mr-2" />
              Mark All Absent
            </Button>
            
            <div className="flex items-center gap-4 ml-auto">
              <Badge className="bg-green-100 text-green-800">
                Present: {presentCount}
              </Badge>
              <Badge className="bg-red-100 text-red-800">
                Absent: {absentCount}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800">
            <Users className="h-5 w-5" />
            Students - Class {assignedClass}, Section {assignedSection}
            <Badge variant="secondary" className="ml-2">
              {filteredStudents.length} students
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-slate-600">Loading attendance data...</span>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => {
                const isPresent = attendance[student.id] || false;
                const hasExistingRecord = student.id in existingAttendance;
                
                return (
                  <div
                    key={student.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isPresent
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isPresent}
                        onCheckedChange={(checked) => 
                          handleAttendanceChange(student.id, checked as boolean)
                        }
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">
                          {student.firstName} {student.lastName}
                        </div>
                        {student.rollNumber && (
                          <div className="text-sm text-slate-600">Roll: {student.rollNumber}</div>
                        )}
                        <div className="text-sm text-slate-600">{student.email}</div>
                        {student.age && (
                          <div className="text-xs text-slate-500">Age: {student.age}</div>
                        )}
                        {hasExistingRecord && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Previously marked
                          </Badge>
                        )}
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        isPresent ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {students.length === 0 ? "No students assigned" : "No students match your search"}
              </h3>
              <p className="text-slate-600">
                {students.length === 0 
                  ? "No students are assigned to your class and section yet."
                  : "Try adjusting your search criteria."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {filteredStudents.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 h-auto"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AttendanceForm;
