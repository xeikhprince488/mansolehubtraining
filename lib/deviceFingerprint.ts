export interface DeviceInfo {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  colorDepth: number;
  hardwareConcurrency: number;
  deviceMemory?: number;
  cookieEnabled: boolean;
  doNotTrack: string | null;
}

export const generateDeviceFingerprint = async (): Promise<{ fingerprint: string; deviceInfo: DeviceInfo }> => {
  if (typeof window === 'undefined') {
    throw new Error('Device fingerprinting can only be done on the client side');
  }

  const deviceInfo: DeviceInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    colorDepth: screen.colorDepth,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
  };

  // Create a more sophisticated fingerprint
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint test', 2, 2);
  }
  const canvasFingerprint = canvas.toDataURL();

  // Combine all factors to create unique fingerprint
  const combinedString = [
    deviceInfo.userAgent,
    deviceInfo.language,
    deviceInfo.platform,
    deviceInfo.screenResolution,
    deviceInfo.timezone,
    deviceInfo.colorDepth.toString(),
    deviceInfo.hardwareConcurrency.toString(),
    deviceInfo.deviceMemory?.toString() || '',
    deviceInfo.cookieEnabled.toString(),
    deviceInfo.doNotTrack || '',
    canvasFingerprint
  ].join('|');

  // Generate hash
  const encoder = new TextEncoder();
  const data = encoder.encode(combinedString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return { fingerprint, deviceInfo };
};

export const getServerDeviceInfo = (request: Request) => {
  const userAgent = request.headers.get('user-agent') || '';
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  return {
    userAgent,
    ipAddress: ipAddress.split(',')[0].trim(), // Get first IP if multiple
  };
};