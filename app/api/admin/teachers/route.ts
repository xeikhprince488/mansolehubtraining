import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// Define Prisma error type
interface PrismaError {
  code?: string;
  meta?: {
    target?: string[];
  };
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const { email, firstName, lastName, assignedClass, assignedSection } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if teacher already exists
    const existingTeacher = await db.teacher.findUnique({
      where: { email },
    });

    if (existingTeacher) {
      return new NextResponse(
        JSON.stringify({
          error: "Duplicate Teacher",
          message: `A teacher with email '${email}' already exists in the system.`,
          details: {
            existingTeacher: {
              name: `${existingTeacher.firstName} ${existingTeacher.lastName}`,
              assignedClass: existingTeacher.assignedClass,
              assignedSection: existingTeacher.assignedSection,
              email: existingTeacher.email,
              isActive: existingTeacher.isActive
            }
          }
        }),
        { 
          status: 409, // Conflict status code for duplicates
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return new NextResponse(
        JSON.stringify({
          error: "Missing Required Fields",
          message: "Please fill in all required fields: email, first name, and last name.",
          missingFields: [
            !email && "email",
            !firstName && "firstName",
            !lastName && "lastName"
          ].filter(Boolean)
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate a temporary unique userId for the teacher
    const tempUserId = `temp_teacher_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    const teacher = await db.teacher.create({
      data: {
        userId: tempUserId, // Temporary unique ID until teacher signs up
        email,
        firstName,
        lastName,
        assignedClass: assignedClass || null,
        assignedSection: assignedSection || null,
        addedById: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Teacher added successfully!",
      teacher
    });
  } catch (error: unknown) {
    console.log("[TEACHERS_POST]", error);
    
    // Type guard for Prisma errors
    const isPrismaError = (err: unknown): err is PrismaError => {
      return typeof err === 'object' && err !== null && 'code' in err;
    };
    
    // Handle Prisma unique constraint errors
    if (isPrismaError(error) && error.code === 'P2002') {
      return new NextResponse(
        JSON.stringify({
          error: "Duplicate Entry",
          message: "A teacher with this information already exists in the database.",
          field: error.meta?.target?.[0] || "unknown"
        }),
        { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while adding the teacher. Please try again."
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();


    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const teachers = await db.teacher.findMany({
      where: {
        addedById: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(teachers);
  } catch (error: unknown) {
    console.log("[TEACHERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}