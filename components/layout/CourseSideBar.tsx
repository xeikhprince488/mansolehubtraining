import { db } from "@/lib/db";
import { Course, Section } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { Progress } from "../ui/progress";
import { BookOpen, Play, CheckCircle, Clock, Award, Target, Home, User, Settings, LogOut, GraduationCap, FileText } from "lucide-react";
import { CourseSideBarClient } from "./CourseSideBarClient";

interface CourseSideBarProps {
  course: Course & { sections: Section[] };
  studentId: string;
}

const CourseSideBar = async ({ course, studentId }: CourseSideBarProps) => {
  const publishedSections = await db.section.findMany({
    where: {
      courseId: course.id,
      isPublished: true,
    },
    orderBy: {
      position: "asc",
    },
  });

  const publishedSectionIds = publishedSections.map((section) => section.id);

  const purchase = await db.purchase.findUnique({
    where: {
      customerId_courseId: {
        customerId: studentId,
        courseId: course.id,
      },
    },
  });

  const completedSections = await db.progress.count({
    where:{
      studentId,
      sectionId: {
        in: publishedSectionIds,
      },
      isCompleted: true,
    }
  });

  const progressPercentage = publishedSectionIds.length > 0 
    ? (completedSections / publishedSectionIds.length) * 100 
    : 0;

  return (
    <CourseSideBarClient 
      course={course}
      publishedSections={publishedSections}
      completedSections={completedSections}
      purchase={purchase}
      progressPercentage={progressPercentage}
    />
  );
};

export default CourseSideBar;