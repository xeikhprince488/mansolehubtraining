import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteParams {
  params: {
    studentId: string;
  };
}

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // In PUT handler
    const { email, firstName, lastName, isActive, class: studentClass, section, age, rollNumber } = await req.json();

    if (!email || !firstName || !lastName || typeof isActive !== "boolean") {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if student exists and user has permission to edit
    const existingStudent = await db.student.findUnique({
      where: {
        id: params.studentId,
        addedById: userId,
      },
    });

    if (!existingStudent) {
      return new NextResponse("Student not found", { status: 404 });
    }

    // Check if email is already taken by another student
    if (email !== existingStudent.email) {
      const emailExists = await db.student.findUnique({
        where: { email },
      });

      if (emailExists) {
        return new NextResponse("Email already in use", { status: 400 });
      }
    }

    const student = await db.student.update({
      where: {
        id: params.studentId,
      },
      data: {
        email,
        firstName,
        lastName,
        isActive,
        class: studentClass,
        section,
        age,
        rollNumber, // Add this field
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("[STUDENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const DELETE = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { userId } = await auth();


    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if student exists and user has permission to delete
    const existingStudent = await db.student.findUnique({
      where: {
        id: params.studentId,
        addedById: userId,
      },
    });

    if (!existingStudent) {
      return new NextResponse("Student not found", { status: 404 });
    }

    await db.student.delete({
      where: {
        id: params.studentId,
      },
    });

    return new NextResponse("Student deleted successfully", { status: 200 });
  } catch (error) {
    console.error("[STUDENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};