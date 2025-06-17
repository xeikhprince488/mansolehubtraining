import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteParams {
  params: {
    teacherId: string;
  };
}

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email, firstName, lastName, isActive } = await req.json();

    if (!email || !firstName || !lastName || typeof isActive !== "boolean") {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if teacher exists and user has permission to edit
    const existingTeacher = await db.teacher.findUnique({
      where: {
        id: params.teacherId,
        addedById: userId,
      },
    });

    if (!existingTeacher) {
      return new NextResponse("Teacher not found", { status: 404 });
    }

    // Check if email is already taken by another teacher
    if (email !== existingTeacher.email) {
      const emailExists = await db.teacher.findUnique({
        where: { email },
      });

      if (emailExists) {
        return new NextResponse("Email already in use", { status: 400 });
      }
    }

    const teacher = await db.teacher.update({
      where: {
        id: params.teacherId,
      },
      data: {
        email,
        firstName,
        lastName,
        isActive,
      },
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("[TEACHER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const DELETE = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if teacher exists and user has permission to delete
    const existingTeacher = await db.teacher.findUnique({
      where: {
        id: params.teacherId,
        addedById: userId,
      },
    });

    if (!existingTeacher) {
      return new NextResponse("Teacher not found", { status: 404 });
    }

    await db.teacher.delete({
      where: {
        id: params.teacherId,
      },
    });

    return new NextResponse("Teacher deleted successfully", { status: 200 });
  } catch (error) {
    console.error("[TEACHER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};