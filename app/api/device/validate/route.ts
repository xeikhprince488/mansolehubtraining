import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId, deviceFingerprint } = await req.json();
    const customerEmail = user.emailAddresses[0].emailAddress;

    // Find the purchase
    const purchase = await db.purchase.findUnique({
      where: {
        customerEmail_courseId: {
          customerEmail,
          courseId,
        },
      },
    });

    if (!purchase) {
      return NextResponse.json({ 
        hasAccess: false, 
        reason: "No purchase found" 
      });
    }

    // If device locking is disabled for this purchase, allow access
    if (!purchase.isDeviceLocked) {
      return NextResponse.json({ hasAccess: true });
    }

    // Check if this is the registered device
    if (purchase.deviceFingerprint === deviceFingerprint) {
      return NextResponse.json({ hasAccess: true });
    }

    // Check if device has been explicitly allowed
    const deviceAccess = await db.deviceAccess.findUnique({
      where: {
        purchaseId_deviceFingerprint: {
          purchaseId: purchase.id,
          deviceFingerprint,
        },
      },
    });

    if (deviceAccess && !deviceAccess.isBlocked) {
      return NextResponse.json({ hasAccess: true });
    }

    return NextResponse.json({ 
      hasAccess: false, 
      reason: "Device not authorized",
      registeredDevice: {
        fingerprint: purchase.deviceFingerprint,
        info: purchase.deviceInfo,
      }
    });
  } catch (error) {
    console.error("[DEVICE_VALIDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};