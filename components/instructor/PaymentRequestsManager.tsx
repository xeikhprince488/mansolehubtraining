"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, Clock, Mail, User, CreditCard, PlayCircle, BookOpen, TrendingUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import PaymentSearchBar from "./PaymentSearchBar";

interface StudentProgress {
  totalSections: number;
  completedSections: number;
  progressPercentage: number;
  lastActivity: string | null;
  totalStudyTime: number;
  totalWatchTimeMinutes: number;
  totalVideoDurationMinutes: number;
  overallWatchPercentage: number;
  sectionProgress: {
    sectionId: string;
    sectionTitle: string;
    sectionPosition: number;
    isCompleted: boolean;
    completedAt: string;
    hasVideo: boolean;
    watchTimeSeconds: number;
    watchPercentage: number;
    lastWatchedAt: string | null;
  }[];
}

interface PaymentRequest {
    id: string;
    studentEmail: string;
    studentName: string;
    fatherName?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    cnicNumber?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    qualification?: string;
    occupation?: string;
    courseId: string;
    course: {
      title: string;
      price: number;
    };
    transactionImage: string;
    bankDetails: string;
    status: string;
    approvedBy?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
    studentProgress?: StudentProgress;
  }

interface PaymentRequestsManagerProps {
  courses: { id: string; title: string }[];
}

interface SearchFilters {
  searchTerm: string;
  status: string;
  courseId: string;
}

const PaymentRequestsManager = ({ courses }: PaymentRequestsManagerProps) => {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPaymentRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/instructor/payment-requests");
      setRequests(response.data);
      setFilteredRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch payment requests:", error);
      toast.error("Failed to load payment requests");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentRequests();
  }, [fetchPaymentRequests]);

  // Handle search and filtering
  const handleSearch = useCallback((filters: SearchFilters) => {
    let filtered = [...requests];

    // Text search
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((request) =>
        request.studentName?.toLowerCase().includes(searchLower) ||
        request.studentEmail?.toLowerCase().includes(searchLower) ||
        request.course?.title?.toLowerCase().includes(searchLower) ||
        request.phoneNumber?.toLowerCase().includes(searchLower) ||
        request.city?.toLowerCase().includes(searchLower) ||
        request.cnicNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter - only apply if status has a value and is not 'all'
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((request) => request.status === filters.status);
    }

    // Course filter - only apply if courseId has a value and is not 'all'
    if (filters.courseId && filters.courseId !== "all") {
      filtered = filtered.filter((request) => request.courseId === filters.courseId);
    }

    setFilteredRequests(filtered);
  }, [requests]);

  const handleApprove = async (requestId: string, courseId: string, studentEmail: string) => {
    setActionLoading(true);
    try {
      await axios.post(`/api/instructor/payment-requests/${requestId}/approve`, {
        courseId,
        studentEmail
      });
      toast.success("Payment approved and course access granted!");
      fetchPaymentRequests();
    } catch (error) {
      console.error("Failed to approve payment:", error);
      toast.error("Failed to approve payment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    try {
      await axios.post(`/api/instructor/payment-requests/${requestId}/reject`, {
        reason: rejectionReason
      });
      toast.success("Payment request rejected");
      setRejectionReason("");
      setSelectedRequest(null);
      fetchPaymentRequests();
    } catch (error) {
      console.error("Failed to reject payment:", error);
      toast.error("Failed to reject payment");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProgressBadge = (percentage: number) => {
    if (percentage === 0) return <Badge variant="outline" className="text-gray-600 border-gray-600">Not Started</Badge>;
    if (percentage < 25) return <Badge variant="outline" className="text-red-600 border-red-600">Just Started</Badge>;
    if (percentage < 50) return <Badge variant="outline" className="text-orange-600 border-orange-600">In Progress</Badge>;
    if (percentage < 75) return <Badge variant="outline" className="text-blue-600 border-blue-600">Good Progress</Badge>;
    if (percentage < 100) return <Badge variant="outline" className="text-purple-600 border-purple-600">Almost Done</Badge>;
    return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
  };

  // Add these helper functions
  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getWatchProgressBadge = (percentage: number) => {
    if (percentage === 0) return <Badge variant="outline" className="text-gray-600 border-gray-600">Not Watched</Badge>;
    if (percentage < 25) return <Badge variant="outline" className="text-red-600 border-red-600">{percentage}% Watched</Badge>;
    if (percentage < 50) return <Badge variant="outline" className="text-orange-600 border-orange-600">{percentage}% Watched</Badge>;
    if (percentage < 75) return <Badge variant="outline" className="text-blue-600 border-blue-600">{percentage}% Watched</Badge>;
    if (percentage < 100) return <Badge variant="outline" className="text-purple-600 border-purple-600">{percentage}% Watched</Badge>;
    return <Badge variant="outline" className="text-green-600 border-green-600">Fully Watched</Badge>;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading payment requests...</div>;
  }

  return (
    <div className="space-y-6">
      <PaymentSearchBar onSearch={handleSearch} courses={courses} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Manual Payment Requests
          </CardTitle>
          <CardDescription>
            Review and approve student payment requests for course access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {requests.length === 0 ? "No payment requests found" : "No payment requests found matching your criteria"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{request.studentName}</span>
                          <span className="text-sm text-gray-500">{request.studentEmail}</span>
                          {request.phoneNumber && (
                            <span className="text-xs text-gray-400">{request.phoneNumber}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{request.course.title}</span>
                        <span className="text-sm text-gray-500">Course ID: {request.courseId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">PKR {request.course.price}</span>
                    </TableCell>
                    <TableCell>
                      {request.studentProgress ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Progress value={request.studentProgress.progressPercentage} className="w-16 h-2" />
                            <span className="text-xs">{request.studentProgress.progressPercentage}%</span>
                          </div>
                          {getProgressBadge(request.studentProgress.progressPercentage)}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-gray-600 border-gray-600">No Progress</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Payment Request Details - {request.studentName}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Student Information */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Student Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-medium">Full Name</Label>
                                    <p className="text-sm">{request.studentName}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Email Address</Label>
                                    <p className="text-sm">{request.studentEmail}</p>
                                  </div>
                                  {request.fatherName && (
                                    <div>
                                      <Label className="font-medium">Father&apos;s Name</Label>
                                      <p className="text-sm">{request.fatherName}</p>
                                    </div>
                                  )}
                                  {request.phoneNumber && (
                                    <div>
                                      <Label className="font-medium">Phone Number</Label>
                                      <p className="text-sm">{request.phoneNumber}</p>
                                    </div>
                                  )}
                                  {request.whatsappNumber && (
                                    <div>
                                      <Label className="font-medium">WhatsApp Number</Label>
                                      <p className="text-sm">{request.whatsappNumber}</p>
                                    </div>
                                  )}
                                  {request.cnicNumber && (
                                    <div>
                                      <Label className="font-medium">CNIC Number</Label>
                                      <p className="text-sm">{request.cnicNumber}</p>
                                    </div>
                                  )}
                                  {request.dateOfBirth && (
                                    <div>
                                      <Label className="font-medium">Date of Birth</Label>
                                      <p className="text-sm">{new Date(request.dateOfBirth).toLocaleDateString()}</p>
                                    </div>
                                  )}
                                  {request.address && (
                                    <div>
                                      <Label className="font-medium">Address</Label>
                                      <p className="text-sm">{request.address}</p>
                                    </div>
                                  )}
                                  {request.city && (
                                    <div>
                                      <Label className="font-medium">City</Label>
                                      <p className="text-sm">{request.city}</p>
                                    </div>
                                  )}
                                  {request.qualification && (
                                    <div>
                                      <Label className="font-medium">Qualification</Label>
                                      <p className="text-sm">{request.qualification}</p>
                                    </div>
                                  )}
                                  {request.occupation && (
                                    <div>
                                      <Label className="font-medium">Occupation</Label>
                                      <p className="text-sm">{request.occupation}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Course Information */}
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                  <BookOpen className="h-4 w-4" />
                                  Course Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-medium">Course Title</Label>
                                    <p className="text-sm">{request.course.title}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Course ID</Label>
                                    <p className="text-sm">{request.courseId}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Course Price</Label>
                                    <p className="text-sm font-semibold">PKR {request.course.price}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Payment Status</Label>
                                    <div className="mt-1">{getStatusBadge(request.status)}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Information */}
                              <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  Payment Information
                                </h3>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="font-medium">Bank Details</Label>
                                    <p className="text-sm whitespace-pre-wrap">{request.bankDetails}</p>
                                  </div>
                                  {request.transactionImage && (
                                    <div>
                                      <Label className="font-medium">Transaction Proof</Label>
                                      <div className="mt-2">
                                        <Image
                                          src={request.transactionImage}
                                          alt="Transaction proof"
                                          width={400}
                                          height={300}
                                          className="rounded border shadow-sm"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="font-medium">Request Date</Label>
                                      <p className="text-sm">{new Date(request.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <Label className="font-medium">Last Updated</Label>
                                      <p className="text-sm">{new Date(request.updatedAt).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  {request.approvedBy && (
                                    <div>
                                      <Label className="font-medium">Approved By</Label>
                                      <p className="text-sm">{request.approvedBy}</p>
                                    </div>
                                  )}
                                  {request.rejectionReason && (
                                    <div>
                                      <Label className="font-medium">Rejection Reason</Label>
                                      <p className="text-sm text-red-600">{request.rejectionReason}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Student Progress (if available) */}
                              {request.studentProgress && (
                                <div className="bg-purple-50 p-4 rounded-lg">
                                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Learning Progress
                                  </h3>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-medium">Overall Progress</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Progress value={request.studentProgress.progressPercentage} className="flex-1" />
                                          <span className="text-sm font-medium">{request.studentProgress.progressPercentage}%</span>
                                        </div>
                                        <div className="mt-1">{getProgressBadge(request.studentProgress.progressPercentage)}</div>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Video Watch Progress</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Progress value={request.studentProgress.overallWatchPercentage} className="flex-1" />
                                          <span className="text-sm font-medium">{request.studentProgress.overallWatchPercentage}%</span>
                                        </div>
                                        <div className="mt-1">{getWatchProgressBadge(request.studentProgress.overallWatchPercentage)}</div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                      <div>
                                        <Label className="font-medium">Completed Sections</Label>
                                        <p className="text-sm">{request.studentProgress.completedSections} / {request.studentProgress.totalSections}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Total Study Time</Label>
                                        <p className="text-sm">{formatStudyTime(request.studentProgress.totalStudyTime)}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Video Watch Time</Label>
                                        <p className="text-sm">{formatWatchTime(request.studentProgress.totalWatchTimeMinutes * 60)}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Last Activity</Label>
                                        <p className="text-sm">
                                          {request.studentProgress.lastActivity 
                                            ? new Date(request.studentProgress.lastActivity).toLocaleDateString()
                                            : 'No activity'
                                          }
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Section Progress Details */}
                                    {request.studentProgress.sectionProgress && request.studentProgress.sectionProgress.length > 0 && (
                                      <div>
                                        <Label className="font-medium">Section-wise Progress</Label>
                                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                          {request.studentProgress.sectionProgress.map((section) => (
                                            <div key={section.sectionId} className="flex items-center justify-between p-2 bg-white rounded border">
                                              <div className="flex-1">
                                                <p className="text-sm font-medium">{section.sectionTitle}</p>
                                                <p className="text-xs text-gray-500">Position: {section.sectionPosition}</p>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                {section.hasVideo && (
                                                  <div className="text-xs">
                                                    <PlayCircle className="h-3 w-3 inline mr-1" />
                                                    {section.watchPercentage}% watched
                                                  </div>
                                                )}
                                                <Badge variant={section.isCompleted ? "default" : "outline"} className="text-xs">
                                                  {section.isCompleted ? "Completed" : "Pending"}
                                                </Badge>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request.id, request.courseId, request.studentEmail)}
                              disabled={actionLoading}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Payment Request</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="reason">Rejection Reason</Label>
                                    <Textarea
                                      id="reason"
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Please provide a reason for rejection..."
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setRejectionReason("")}>
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleReject(request.id)}
                                      disabled={actionLoading}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentRequestsManager;