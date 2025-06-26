import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const GET = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const user = await currentUser();

    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const customerEmail = user.emailAddresses[0].emailAddress;
    const url = new URL(req.url);
    const deviceFingerprint = url.searchParams.get('deviceFingerprint');

    const purchase = await db.purchase.findUnique({
      where: {
        customerEmail_courseId: {
          customerEmail: customerEmail,
          courseId: params.courseId,
        },
      },
    });

    if (!purchase) {
      return NextResponse.json({
        hasPurchase: false,
        hasDeviceAccess: false,
        purchase: null,
        deviceAccessInfo: null
      });
    }

    let hasDeviceAccess = true;
    let deviceAccessInfo = null;

    // Check device access if device locking is enabled
    if (purchase.isDeviceLocked && deviceFingerprint) {
      // If no device is registered yet, allow access for first-time registration
      if (!purchase.deviceFingerprint) {
        hasDeviceAccess = true;
        deviceAccessInfo = {
          registeredDevice: null,
          currentDevice: deviceFingerprint,
          isFirstTime: true,
        };
      } else if (purchase.deviceFingerprint === deviceFingerprint) {
        hasDeviceAccess = true;
        deviceAccessInfo = {
          registeredDevice: purchase.deviceFingerprint,
          currentDevice: deviceFingerprint,
          isBlocked: false,
        };
      } else {
        // Check if device has been explicitly allowed
        const deviceAccess = await db.deviceAccess.findUnique({
          where: {
            purchaseId_deviceFingerprint: {
              purchaseId: purchase.id,
              deviceFingerprint,
            },
          },
        });
        
        hasDeviceAccess = !!deviceAccess && !deviceAccess.isBlocked;
        deviceAccessInfo = {
          registeredDevice: purchase.deviceFingerprint,
          currentDevice: deviceFingerprint,
          isBlocked: deviceAccess?.isBlocked || false,
        };
      }
    }

    return NextResponse.json({
      hasPurchase: !!purchase,
      hasDeviceAccess,
      deviceAccessInfo,
      purchase: {
        id: purchase.id,
        deviceFingerprint: purchase.deviceFingerprint,
        isDeviceLocked: purchase.isDeviceLocked,
        // Don't expose sensitive data
      }
    });
  } catch (error) {
    console.error("[PURCHASE_STATUS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};