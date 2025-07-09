"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Play } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import ManualPaymentForm from "@/components/sections/ManualPaymentForm";
import { Course } from "@prisma/client";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CourseOverviewClientProps {
  course: Course;
}

const CourseOverviewClient = ({ course }: CourseOverviewClientProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showManualPayment, setShowManualPayment] = useState(false);
  const router = useRouter();

  const buyCourse = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/api/courses/${course.id}/checkout`);
      window.location.assign(response.data.url);
    } catch (err) {
      console.log("Failed to checkout course", err);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentOption = () => {
    setShowManualPayment(true);
  };

  const handlePaymentSubmitted = () => {
    setShowManualPayment(false);
    toast.success("Payment request submitted! You'll be notified once approved.");
    
    // Start checking for approval every 10 seconds
    const checkApproval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/courses/${course.id}/purchase-status`);
        if (response.data.hasPurchase) {
          toast.success("🎉 Payment approved! Course unlocked!");
          router.refresh();
          clearInterval(checkApproval);
        }
      } catch (error) {
        // Continue checking
      }
    }, 10000);

    // Stop checking after 10 minutes
    setTimeout(() => clearInterval(checkApproval), 600000);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <Button 
          onClick={handlePaymentOption}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <Play className="h-4 w-4" />
          Add Inquiry
        </Button>
        
        {/* <form action={`/api/courses/${course.id}/checkout`} method="POST">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            {isLoading ? "Processing..." : "Quick Checkout"}
          </button>
        </form> */}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showManualPayment} onOpenChange={setShowManualPayment}>
        <DialogContent className="p-0 border-0 bg-transparent max-w-2xl">
          <VisuallyHidden>
            <DialogTitle>Course Purchase Payment</DialogTitle>
            <DialogDescription>
              Complete your course purchase by submitting payment details and transaction proof
            </DialogDescription>
          </VisuallyHidden>
          <ManualPaymentForm 
            course={course} 
            onClose={() => setShowManualPayment(false)}
            onSubmitted={handlePaymentSubmitted}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseOverviewClient;