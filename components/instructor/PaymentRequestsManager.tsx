"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, Clock, Mail, User, CreditCard } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";

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
  }
const PaymentRequestsManager = () => {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  const fetchPaymentRequests = async () => {
    try {
      const response = await axios.get("/api/instructor/payment-requests");
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch payment requests:", error);
      toast.error("Failed to load payment requests");
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading payment requests...</div>;
  }

  return (
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
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payment requests found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{request.studentName}</div>
                      <div className="text-sm text-gray-500">{request.studentEmail}</div>
                      {request.phoneNumber && (
                        <div className="text-sm text-gray-500">📱 {request.phoneNumber}</div>
                      )}
                      {request.city && (
                        <div className="text-sm text-gray-500">📍 {request.city}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{request.course.title}</TableCell>
                  <TableCell>${request.course.price}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Payment Request Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Student Information Section */}
                            <div className="border rounded-lg p-4">
                              <h3 className="text-lg font-semibold mb-4 text-blue-600">Student Information</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Student Name</Label>
                                  <p className="font-medium">{request.studentName}</p>
                                </div>
                                <div>
                                  <Label>Father&apos;s Name</Label>
                                  <p className="font-medium">{request.fatherName || 'Not provided'}</p>
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  <p className="font-medium">{request.studentEmail}</p>
                                </div>
                                <div>
                                  <Label>Phone Number</Label>
                                  <p className="font-medium">{request.phoneNumber || 'Not provided'}</p>
                                </div>
                                <div>
                                  <Label>WhatsApp Number</Label>
                                  <p className="font-medium">{request.whatsappNumber || 'Not provided'}</p>
                                </div>
                                <div>
                                  <Label>CNIC Number</Label>
                                  <p className="font-medium">{request.cnicNumber || 'Not provided'}</p>
                                </div>
                                <div>
                                  <Label>Date of Birth</Label>
                                  <p className="font-medium">{request.dateOfBirth || 'Not provided'}</p>
                                </div>
                                <div>
                                  <Label>Qualification</Label>
                                  <p className="font-medium">{request.qualification || 'Not provided'}</p>
                                </div>
                                <div>
                                  <Label>Occupation</Label>
                                  <p className="font-medium">{request.occupation || 'Not provided'}</p>
                                </div>
                                <div>
                                  <Label>City</Label>
                                  <p className="font-medium">{request.city || 'Not provided'}</p>
                                </div>
                              </div>
                              <div className="mt-4">
                                <Label>Address</Label>
                                <p className="font-medium">{request.address || 'Not provided'}</p>
                              </div>
                            </div>

                            {/* Course Information Section */}
                            <div className="border rounded-lg p-4">
                              <h3 className="text-lg font-semibold mb-4 text-green-600">Course Information</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Course</Label>
                                  <p className="font-medium">{request.course.title}</p>
                                </div>
                                <div>
                                  <Label>Amount</Label>
                                  <p className="font-medium">${request.course.price}</p>
                                </div>
                                <div>
                                  <Label>Request Date</Label>
                                  <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">{getStatusBadge(request.status)}</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Transaction Proof Section */}
                            <div className="border rounded-lg p-4">
                              <h3 className="text-lg font-semibold mb-4 text-purple-600">Transaction Proof</h3>
                              <div className="mt-2 border rounded-lg p-4 bg-gray-50">
                                <Image
                                  src={request.transactionImage}
                                  alt="Transaction proof"
                                  width={500}
                                  height={400}
                                  className="max-w-full h-auto rounded shadow-md"
                                />
                              </div>
                            </div>

                            {/* Bank Details Section */}
                            {request.bankDetails && (
                              <div className="border rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-4 text-orange-600">Bank Details</h3>
                                <p className="font-medium">{request.bankDetails}</p>
                              </div>
                            )}

                            {/* Rejection Reason Section */}
                            {request.status === 'rejected' && request.rejectionReason && (
                              <div className="border rounded-lg p-4 border-red-200 bg-red-50">
                                <h3 className="text-lg font-semibold mb-4 text-red-600">Rejection Reason</h3>
                                <p className="font-medium text-red-700">{request.rejectionReason}</p>
                              </div>
                            )}

                            {request.status === "pending" && (
                              <div className="flex gap-2 pt-4 border-t">
                                <Button
                                  onClick={() => handleApprove(request.id, request.courseId, request.studentEmail)}
                                  disabled={actionLoading}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve & Grant Access
                                </Button>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="destructive">
                                      <XCircle className="h-4 w-4 mr-2" />
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
                                          rows={3}
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => handleReject(request.id)}
                                          disabled={actionLoading}
                                          variant="destructive"
                                        >
                                          Reject Request
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentRequestsManager;