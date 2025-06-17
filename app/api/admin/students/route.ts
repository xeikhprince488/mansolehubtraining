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
    const { email, firstName, lastName, class: studentClass, section, age, rollNumber } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if student already exists
    const existingStudent = await db.student.findUnique({
      where: { email },
    });

    if (existingStudent) {
      return new NextResponse(
        JSON.stringify({
          error: "Duplicate Student",
          message: `A student with email '${email}' already exists in the system.`,
          details: {
            existingStudent: {
              name: `${existingStudent.firstName} ${existingStudent.lastName}`,
              class: existingStudent.class,
              section: existingStudent.section,
              email: existingStudent.email
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
    if (!email || !firstName || !lastName || !studentClass || !section || !age || !rollNumber) {
      return new NextResponse(
        JSON.stringify({
          error: "Missing Required Fields",
          message: "Please fill in all required fields: email, first name, last name, class, section, age, and roll number.",
          missingFields: [
            !email && "email",
            !firstName && "firstName",
            !lastName && "lastName",
            !studentClass && "class",
            !section && "section",
            !age && "age",
            !rollNumber && "rollNumber"
          ].filter(Boolean)
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate a unique temporary userId for each student
    const tempUserId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const student = await db.student.create({
      data: {
        userId: tempUserId, // Each student gets a unique temporary ID
        email,
        firstName,
        lastName,
        class: studentClass,
        section,
        age,
        rollNumber,
        addedById: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student added successfully!",
      student
    });
  } catch (error: unknown) {
    console.log("[STUDENTS_POST]", error);
    
    // Type guard for Prisma errors
    const isPrismaError = (err: unknown): err is PrismaError => {
      return typeof err === 'object' && err !== null && 'code' in err;
    };
    
    // Handle Prisma unique constraint errors
    if (isPrismaError(error) && error.code === 'P2002') {
      return new NextResponse(
        JSON.stringify({
          error: "Duplicate Entry",
          message: "A student with this information already exists in the database.",
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
        message: "An unexpected error occurred while adding the student. Please try again."
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

    const students = await db.student.findMany({
      where: {
        addedById: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(students);
  } catch (error: unknown) {
    console.log("[STUDENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}