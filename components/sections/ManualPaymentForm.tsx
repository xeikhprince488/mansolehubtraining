"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CreditCard, Mail, User, AlertCircle, CheckCircle, Phone, MapPin, Calendar, CreditCard as IdCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import toast from "react-hot-toast";
import { Course } from "@prisma/client";
import FileUpload from "../custom/FileUpload";

interface ManualPaymentFormProps {
  course: Course;
  onClose: () => void;
  onSubmitted?: () => void;
}

interface FormData {
  studentEmail: string;
  studentName: string;
  fatherName: string;
  phoneNumber: string;
  whatsappNumber: string;
  cnicNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  qualification: string;
  occupation: string;
  transactionImage: string; // Changed from File | null to string
}

const ManualPaymentForm = ({ course, onClose, onSubmitted }: ManualPaymentFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    studentEmail: "",
    studentName: "",
    fatherName: "",
    phoneNumber: "",
    whatsappNumber: "",
    cnicNumber: "",
    dateOfBirth: "",
    address: "",
    city: "",
    qualification: "",
    occupation: "",
    transactionImage: "", // Changed from null to empty string
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const bankDetails = {
    accountNumber: "00482011215761",
    accountTitle: "MANSOL HAB SCHOOL OF SKILLS DEVELOPMENT",
    bankName: "Silk Bank"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentEmail || !formData.studentName || !formData.phoneNumber || !formData.transactionImage) {
      toast.error("Please fill all required fields and upload transaction proof");
      return;
    }

    setIsLoading(true);
    
    try {
      // Send as JSON instead of FormData since we now have URL
      const dataToSend = {
        ...formData,
        courseId: course.id,
        bankDetails: JSON.stringify(bankDetails)
      };

      await axios.post(`/api/courses/${course.id}/manual-payment`, dataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setIsSubmitted(true);
      toast.success("Payment request submitted successfully!");
      onClose();
      onSubmitted?.();
    } catch (error) {
      console.error("Payment submission error:", error);
      toast.error("Failed to submit payment request");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Payment Request Submitted!</CardTitle>
          <CardDescription>
            Your transaction has been sent for verification. You will receive course access within the next few hours after approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Course Purchase - Payment Details
        </CardTitle>
        <CardDescription>
          Complete your course purchase by transferring to our bank account and filling the form below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bank Details */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p><strong>Account Number:</strong> {bankDetails.accountNumber}</p>
              <p><strong>Account Title:</strong> {bankDetails.accountTitle}</p>
              <p><strong>Bank:</strong> {bankDetails.bankName}</p>
              <p><strong>Amount:</strong> ${course.price}</p>
            </div>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Father&apos;s Name
              </Label>
              <Input
                id="fatherName"
                type="text"
                value={formData.fatherName}
                onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                placeholder="Father's full name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.studentEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, studentEmail: e.target.value }))}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="03xxxxxxxxx"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp Number
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                placeholder="03xxxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnic" className="flex items-center gap-2">
                <IdCard className="h-4 w-4" />
                CNIC Number
              </Label>
              <Input
                id="cnic"
                type="text"
                value={formData.cnicNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, cnicNumber: e.target.value }))}
                placeholder="xxxxx-xxxxxxx-x"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                City
              </Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Your city"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Your complete address"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification
              </Label>
              <Select value={formData.qualification} onValueChange={(value) => setFormData(prev => ({ ...prev, qualification: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select qualification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matric">Matric</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="bachelor">Bachelor&apos;s Degree</SelectItem>
                  <SelectItem value="master">Master&apos;s Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation
              </Label>
              <Input
                id="occupation"
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                placeholder="Your occupation"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Transaction Proof *
            </Label>
            <FileUpload
              value={formData.transactionImage}
              onChange={(url) => setFormData(prev => ({ ...prev, transactionImage: url || "" }))}
              endpoint="transactionImage"
              page="Manual Payment"
            />
            <p className="text-xs text-gray-500">
              Upload a screenshot or photo of your bank transfer receipt (Max 5MB)
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Submitting..." : "Submit Payment Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualPaymentForm;