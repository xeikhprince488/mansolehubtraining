"use client";

import {
  Course,
  MuxData,
  Progress,
  Purchase,
  Resource,
  Section,
} from "@prisma/client";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import axios from "axios";
import { File, Loader2, Lock, Play, Download, BookOpen, Clock, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import ReadText from "@/components/custom/ReadText";
import MuxPlayer from "@mux/mux-player-react";
import Link from "next/link";
import ProgressButton from "./ProgressButton";
import SectionMenu from "../layout/SectionMenu";
import dynamic from "next/dynamic";

import ManualPaymentForm from "./ManualPaymentForm";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface SectionsDetailsProps {
  course: Course & { sections: Section[] };
  section: Section;
  purchase: Purchase | null;
  muxData: MuxData | null;
  resources: Resource[] | [];
  progress: Progress | null;
}

const SectionsDetails = ({
  course,
  section,
  purchase,
  muxData,
  resources,
  progress,
}: SectionsDetailsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState(purchase);
  const router = useRouter();
  const isLocked = !currentPurchase && !section.isFree;

  // Check for purchase updates every 30 seconds if course is locked
  useEffect(() => {
    if (isLocked) {
      const checkPurchaseStatus = async () => {
        try {
          const response = await axios.get(`/api/courses/${course.id}/purchase-status`);
          if (response.data.hasPurchase && !currentPurchase) {
            setCurrentPurchase(response.data.purchase);
            toast.success("🎉 Course unlocked! You now have access to all content.");
            router.refresh(); // Refresh to get updated data
          }
        } catch (error) {
          // Silently handle errors
        }
      };

      const interval = setInterval(checkPurchaseStatus, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isLocked, course.id, currentPurchase, router]);

  const buyCourse = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/api/courses/${course.id}/checkout`);
      window.location.assign(response.data.url);
    } catch (err) {
      console.log("Failed to chechout course", err);
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
          setCurrentPurchase(response.data.purchase);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            {/* Section Title */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="text-blue-200 text-sm font-medium">
                  {course.title}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                {section.title}
              </h1>
              <div className="flex items-center gap-4 text-blue-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Section {course.sections.findIndex(s => s.id === section.id) + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{section.isFree ? 'Free Preview' : 'Premium Content'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <SectionMenu course={course} />
              {!currentPurchase ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={handlePaymentOption}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Buy Course
                  </Button>
                </div>
              ) : (
                <ProgressButton
                  courseId={course.id}
                  sectionId={section.id}
                  isCompleted={!!progress?.isCompleted}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Section Overview</h2>
                </div>
                <div className="prose prose-blue max-w-none">
                  <ReadText value={section.description!} />
                </div>
              </div>

              {/* Video Player */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                {isLocked ? (
                  <div className="p-12 flex flex-col gap-6 items-center text-center">
                    <div className="p-6 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full">
                      <Lock className="h-12 w-12 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Premium Content Locked
                      </h3>
                      <p className="text-gray-600 max-w-md">
                        This video content is part of our premium course. Purchase the course to unlock all sections and start learning!
                      </p>
                    </div>
                    <Button 
                      onClick={handlePaymentOption}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Unlock Course
                    </Button>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800">Video Lesson</h2>
                    </div>
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      <VideoPlayer
                        playbackId={muxData?.playbackId || ""}
                        className="w-full max-w-4xl"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Resources Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
                    <Download className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Resources</h2>
                </div>
                
                {resources.length > 0 ? (
                  <div className="space-y-3">
                    {resources.map((resource) => (
                      <Link
                        key={resource.id}
                        href={resource.fileUrl}
                        target="_blank"
                        className="group flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border border-blue-200/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                      >
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300">
                          <File className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                            {resource.name}
                          </p>
                          <p className="text-sm text-gray-500">Click to download</p>
                        </div>
                        <Download className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <File className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No resources available for this section</p>
                  </div>
                )}
              </div>

              {/* Course Progress Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Course Progress</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Sections</span>
                    <span className="font-medium text-gray-800">{course.sections.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Section</span>
                    <span className="font-medium text-gray-800">
                      {course.sections.findIndex(s => s.id === section.id) + 1}
                    </span>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${((course.sections.findIndex(s => s.id === section.id) + 1) / course.sections.length) * 100}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {Math.round(((course.sections.findIndex(s => s.id === section.id) + 1) / course.sections.length) * 100)}% Complete
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default SectionsDetails;

const VideoPlayer = dynamic(() => import('./VideoPlayer'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-200 animate-pulse rounded-xl"></div>
});
