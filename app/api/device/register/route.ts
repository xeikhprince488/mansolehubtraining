import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getServerDeviceInfo } from "@/lib/deviceFingerprint";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    console.log('=== DEVICE REGISTRATION START ===');
    
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
      console.log('❌ Unauthorized access attempt');
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId, deviceFingerprint, deviceInfo } = await req.json();
    const customerEmail = user.emailAddresses[0].emailAddress;
    const serverDeviceInfo = getServerDeviceInfo(req);

    console.log('📱 Device registration request:', {
      userId,
      customerEmail,
      courseId,
      deviceFingerprint: deviceFingerprint?.substring(0, 16) + '...',
      hasDeviceInfo: !!deviceInfo,
      serverDeviceInfo
    });

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
      console.log('❌ Purchase not found for:', { customerEmail, courseId });
      return new NextResponse("Purchase not found", { status: 404 });
    }

    console.log('✅ Purchase found:', {
      purchaseId: purchase.id,
      hasExistingFingerprint: !!purchase.deviceFingerprint,
      isDeviceLocked: purchase.isDeviceLocked
    });

    // Update purchase with device information if not already set
    if (!purchase.deviceFingerprint) {
      console.log('🔄 Updating purchase with device info...');
      
      const deviceInfoToStore = {
        ...deviceInfo,
        ...serverDeviceInfo,
        registrationTimestamp: new Date().toISOString()
      };
      
      const updatedPurchase = await db.purchase.update({
        where: { id: purchase.id },
        data: {
          deviceFingerprint,
          deviceInfo: JSON.stringify(deviceInfoToStore),
          ipAddress: serverDeviceInfo.ipAddress,
          userAgent: serverDeviceInfo.userAgent,
        },
      });
      
      console.log('✅ Purchase updated successfully:', {
        purchaseId: updatedPurchase.id,
        deviceFingerprint: updatedPurchase.deviceFingerprint?.substring(0, 16) + '...',
        ipAddress: updatedPurchase.ipAddress,
        userAgent: updatedPurchase.userAgent?.substring(0, 50) + '...'
      });
    } else {
      console.log('ℹ️ Purchase already has device fingerprint, skipping update');
    }

    // Create or update device access record
    console.log('🔄 Creating/updating device access record...');
    
    const deviceAccess = await db.deviceAccess.upsert({
      where: {
        purchaseId_deviceFingerprint: {
          purchaseId: purchase.id,
          deviceFingerprint,
        },
      },
      update: {
        lastAccessedAt: new Date(),
        accessCount: {
          increment: 1,
        },
      },
      create: {
        purchaseId: purchase.id,
        deviceFingerprint,
        deviceInfo: JSON.stringify({
          ...deviceInfo,
          ...serverDeviceInfo,
          registrationTimestamp: new Date().toISOString()
        }),
        ipAddress: serverDeviceInfo.ipAddress,
        userAgent: serverDeviceInfo.userAgent,
      },
    });
    
    console.log('✅ Device access record processed:', {
      deviceAccessId: deviceAccess.id,
      accessCount: deviceAccess.accessCount,
      lastAccessed: deviceAccess.lastAccessedAt
    });

    console.log('=== DEVICE REGISTRATION SUCCESS ===');
    return NextResponse.json({ 
      success: true,
      message: 'Device registered successfully',
      deviceFingerprint: deviceFingerprint.substring(0, 16) + '...'
    });
  } catch (error) {
    console.error('❌ [DEVICE_REGISTER] Error:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    return new NextResponse("Internal Error", { status: 500 });
  }
};