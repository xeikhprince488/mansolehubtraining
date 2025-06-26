import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const GET = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all payment requests for courses created by this instructor
    const paymentRequests = await db.manualPaymentRequest.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            instructorId: true,
            sections: {
              select: {
                id: true,
                title: true,
                videoUrl: true,
                isPublished: true,
                position: true,
                muxData: {
                  select: {
                    playbackId: true
                  }
                }
              },
              where: {
                isPublished: true
              },
              orderBy: {
                position: "asc"
              }
            }
          }
        }
      },
      where: {
        course: {
          instructorId: userId
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Import clerkClient for user lookup
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();

    // For each payment request, get detailed student progress data
    const enhancedPaymentRequests = await Promise.all(
      paymentRequests.map(async (request) => {
        let studentProgress = null;
        
        try {
          // Get the actual Clerk userId from the student email
          const usersResponse = await client.users.getUserList({
            emailAddress: [request.studentEmail]
          });
          
          if (usersResponse.data && usersResponse.data.length > 0) {
            const clerkUserId = usersResponse.data[0].id;
            
            // Now query progress using the correct userId
            const progressRecords = await db.progress.findMany({
              where: {
                studentId: clerkUserId, // Use actual Clerk userId
                section: {
                  courseId: request.courseId
                }
              },
              include: {
                section: {
                  select: {
                    id: true,
                    title: true,
                    position: true,
                    videoUrl: true,
                    muxData: {
                      select: {
                        playbackId: true
                      }
                    }
                  }
                }
              },
              orderBy: {
                updatedAt: "desc"
              }
            });

            // Calculate comprehensive progress statistics
            const totalSections = request.course.sections.length;
            const completedSections = progressRecords.filter(p => p.isCompleted).length;
            const progressPercentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
            
            // Calculate total watch time
            const totalWatchTime = progressRecords.reduce((sum, p) => sum + (p.watchTimeSeconds || 0), 0);
            const totalVideoDuration = progressRecords.reduce((sum, p) => sum + (p.videoDurationSeconds || 0), 0);
            const overallWatchPercentage = totalVideoDuration > 0 ? Math.round((totalWatchTime / totalVideoDuration) * 100) : 0;
            
            // Calculate study time (time spent learning)
            const totalStudyTime = Math.round(totalWatchTime / 60); // Convert to minutes
            
            // Get last activity
            const lastActivity = progressRecords.length > 0 ? 
              progressRecords.reduce((latest, current) => 
                (current.lastWatchedAt && (!latest.lastWatchedAt || current.lastWatchedAt > latest.lastWatchedAt)) ? current : latest
              ).lastWatchedAt : null;

            studentProgress = {
              totalSections,
              completedSections,
              progressPercentage,
              totalStudyTime, // Add this line
              totalWatchTimeMinutes: Math.round(totalWatchTime / 60),
              totalVideoDurationMinutes: Math.round(totalVideoDuration / 60),
              overallWatchPercentage,
              lastActivity,
              sectionProgress: progressRecords.map(p => ({
                sectionId: p.section.id,
                sectionTitle: p.section.title,
                sectionPosition: p.section.position,
                isCompleted: p.isCompleted,
                completedAt: p.completedAt,
                watchTimeSeconds: p.watchTimeSeconds || 0,
                videoDurationSeconds: p.videoDurationSeconds || 0,
                watchPercentage: p.watchPercentage || 0,
                lastWatchedPosition: p.lastWatchedPosition || 0,
                lastWatchedAt: p.lastWatchedAt,
                hasVideo: !!p.section.videoUrl
              })).sort((a, b) => a.sectionPosition - b.sectionPosition)
            };
          }
        } catch (error) {
          console.error(`Error fetching progress for ${request.studentEmail}:`, error);
          // Continue without progress data if there's an error
        }

        return {
          ...request,
          studentProgress
        };
      })
    );

    return NextResponse.json(enhancedPaymentRequests);
  } catch (error) {
    console.error("[PAYMENT_REQUESTS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};