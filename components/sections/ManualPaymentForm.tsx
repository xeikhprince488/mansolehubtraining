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
import { generateDeviceFingerprint } from "@/lib/deviceFingerprint";


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
  transactionImage: string;
  notes: string; // Add this new field
}

interface ValidationErrors {
  [key: string]: string;
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
    transactionImage: "",
    notes: "", // Add this new field
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const bankDetails = {
    accountNumber: "00482011215761",
    accountTitle: "MANSOL HAB SCHOOL OF SKILLS DEVELOPMENT",
    bankName: "Silk Bank"
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^03[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const validateCNIC = (cnic: string): boolean => {
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
    return cnicRegex.test(cnic);
  };

  const validateField = (name: string, value: string) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'studentEmail':
        if (value && !validateEmail(value)) {
          errors[name] = 'Please enter a valid email address';
        } else {
          delete errors[name];
        }
        break;
      case 'phoneNumber':
      case 'whatsappNumber':
        if (value && !validatePhone(value)) {
          errors[name] = 'Please enter a valid Pakistani mobile number (03xxxxxxxxx)';
        } else {
          delete errors[name];
        }
        break;
      case 'cnicNumber':
        if (value && !validateCNIC(value)) {
          errors[name] = 'Please enter CNIC in format: xxxxx-xxxxxxx-x';
        } else {
          delete errors[name];
        }
        break;
      case 'studentName':
        if (value && value.length < 2) {
          errors[name] = 'Name must be at least 2 characters long';
        } else {
          delete errors[name];
        }
        break;
      default:
        delete errors[name];
    }
    
    setValidationErrors(errors);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const formatCNIC = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    if (numbers.length <= 12) return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) return numbers;
    return numbers.slice(0, 11);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['studentEmail', 'studentName', 'phoneNumber', 'transactionImage'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
    
    if (missingFields.length > 0) {
      toast.error("Please fill all required fields and upload transaction proof");
      return;
    }

    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    setIsLoading(true);
    
    try {
      const { fingerprint, deviceInfo } = await generateDeviceFingerprint();
      
      const dataToSend = {
        ...formData,
        courseId: course.id,
        bankDetails: JSON.stringify(bankDetails),
        deviceFingerprint: fingerprint,
        deviceInfo: JSON.stringify(deviceInfo)
      };

      // Submit to API
      const response = await axios.post(`/api/courses/${course.id}/manual-payment`, dataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Get the request ID from the response
      const requestId = response.data.requestId || `req-${Date.now()}`;

      // Send email via server-side API
      try {
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            courseName: course.title,
            coursePrice: course.price!,
            requestId: requestId
          }),
        });

        const emailResult = await emailResponse.json();

        if (emailResult.success) {
          console.log('Confirmation email sent successfully');
        } else {
          console.error('Failed to send confirmation email:', emailResult.error);
          // Don't fail the entire process if email fails
          toast.error('Payment submitted but email notification failed');
        }
      } catch (emailError) {
        console.error('Email API error:', emailError);
        toast.error('Payment submitted but email notification failed');
      }

      setIsSubmitted(true);
      toast.success("Payment request submitted successfully!");
      onClose();
      onSubmitted?.();
    } catch (error: any) {
      console.error("Payment submission error:", error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        const errorData = error.response.data;
        
        if (errorData.error === "ALREADY_PURCHASED") {
          toast.success("🎉 Great news! You already own this course!");
          setTimeout(() => {
            window.location.href = errorData.redirectUrl || `/courses/${course.id}`;
          }, 2000);
          onClose();
          return;
        }
        
        if (errorData.error === "PENDING_APPROVAL") {
          const submittedDate = new Date(errorData.submittedAt).toLocaleDateString();
          toast.error(
            `You already have a pending payment request for this course (submitted on ${submittedDate}). Please wait for approval.`,
            { duration: 6000 }
          );
          onClose();
          return;
        }
      }
      
      // Generic error handling
      const errorMessage = error.response?.data?.message || "Failed to submit payment request";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl border-0">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800 mb-2">Payment Request Submitted!</CardTitle>
          <CardDescription className="text-lg text-gray-600 leading-relaxed">
            Your transaction has been sent for verification. You will receive course access within the next few hours after approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button onClick={onClose} className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <CreditCard className="h-6 w-6" />
          Course Purchase - Payment Details
        </CardTitle>
        <CardDescription className="text-blue-100 text-lg mt-2">
          Complete your course purchase by transferring to our bank account and filling the form below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 p-8">
        {/* Bank Details */}
        <Alert className="border-blue-200 bg-blue-50 shadow-md">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <AlertDescription>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-800 text-lg mb-3">Bank Transfer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p className="flex justify-between"><span className="font-medium text-gray-700">Account Number:</span> <span className="font-mono text-blue-800">{bankDetails.accountNumber}</span></p>
                <p className="flex justify-between"><span className="font-medium text-gray-700">Bank:</span> <span className="text-blue-800">{bankDetails.bankName}</span></p>
              </div>
              <p className="text-sm"><span className="font-medium text-gray-700">Account Title:</span> <span className="text-blue-800">{bankDetails.accountTitle}</span></p>
              <p className="text-lg font-bold text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 mt-4">
                <span className="text-gray-700">Amount to Transfer:</span> PKR {course.price}
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 text-blue-600" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => handleInputChange('studentName', e.target.value)}
                  placeholder="Your full name"
                  required
                  className={`h-12 transition-all duration-200 ${validationErrors.studentName ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {validationErrors.studentName && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.studentName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherName" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 text-blue-600" />
                  Father&apos;s Name
                </Label>
                <Input
                  id="fatherName"
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  placeholder="Father's full name"
                  className="h-12 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) => handleInputChange('studentEmail', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className={`h-12 transition-all duration-200 ${validationErrors.studentEmail ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {validationErrors.studentEmail && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.studentEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="h-4 w-4 text-blue-600" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', formatPhone(e.target.value))}
                  placeholder="03xxxxxxxxx"
                  required
                  className={`h-12 transition-all duration-200 ${validationErrors.phoneNumber ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {validationErrors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.phoneNumber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="h-4 w-4 text-green-600" />
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', formatPhone(e.target.value))}
                  placeholder="03xxxxxxxxx"
                  className={`h-12 transition-all duration-200 ${validationErrors.whatsappNumber ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {validationErrors.whatsappNumber && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.whatsappNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnic" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <IdCard className="h-4 w-4 text-blue-600" />
                  CNIC Number
                </Label>
                <Input
                  id="cnic"
                  type="text"
                  value={formData.cnicNumber}
                  onChange={(e) => handleInputChange('cnicNumber', formatCNIC(e.target.value))}
                  placeholder="xxxxx-xxxxxxx-x"
                  className={`h-12 transition-all duration-200 ${validationErrors.cnicNumber ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {validationErrors.cnicNumber && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.cnicNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Additional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dob" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="h-12 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  City
                </Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Your city"
                  className="h-12 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4 text-blue-600" />
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Your complete address"
                rows={3}
                className="focus:border-blue-500 transition-all duration-200 resize-none"
              />
            </div>

            {/* Add Notes Section */}
            <div className="space-y-2 mt-6">
              <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="h-4 w-4 text-blue-600" />
                Personal Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes about yourself, your background, or why you're interested in this course..."
                rows={4}
                className="focus:border-blue-500 transition-all duration-200 resize-none"
              />
              <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
                💡 Optional: Share any relevant information about yourself that might help us serve you better
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="qualification" className="text-sm font-medium text-gray-700">
                  Qualification
                </Label>
                <Select value={formData.qualification} onValueChange={(value) => handleInputChange('qualification', value)}>
                  <SelectTrigger className="h-12 focus:border-blue-500 transition-all duration-200">
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
                <Label htmlFor="occupation" className="text-sm font-medium text-gray-700">
                  Occupation
                </Label>
                <Input
                  id="occupation"
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="Your occupation"
                  className="h-12 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Transaction Proof Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Transaction Proof
            </h3>
            
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Upload className="h-4 w-4 text-blue-600" />
                Upload Transaction Receipt *
              </Label>
              <FileUpload
                value={formData.transactionImage}
                onChange={(url) => handleInputChange('transactionImage', url || "")}
                endpoint="transactionImage"
                page="Manual Payment"
              />
              <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
                📸 Upload a clear screenshot or photo of your bank transfer receipt (Max 5MB)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || Object.keys(validationErrors).length > 0}
              className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Payment Request"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualPaymentForm;