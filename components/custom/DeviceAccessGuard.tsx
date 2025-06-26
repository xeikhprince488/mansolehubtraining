import React from 'react';
import { AlertTriangle, Smartphone, Monitor, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DeviceAccessGuardProps {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
  registeredDevice: string | null;
  children: React.ReactNode;
  courseTitle?: string;
}

const DeviceAccessGuard: React.FC<DeviceAccessGuardProps> = ({
  hasAccess,
  isLoading,
  error,
  registeredDevice,
  children,
  courseTitle = 'this course'
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying device access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800 flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Device Access Restricted
            </CardTitle>
            <CardDescription className="text-red-700">
              You can only access {courseTitle} from the device where you originally purchased it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-red-800">Access Denied</AlertTitle>
              <AlertDescription className="text-red-700">
                {error === 'Device not authorized' 
                  ? 'This device is not authorized to access the course content. Please use the device where you originally purchased the course.'
                  : error || 'Unable to verify course access on this device.'
                }
              </AlertDescription>
            </Alert>
            
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Device Security Information
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Course access is locked to your original purchase device for security</p>
                <p>• This prevents unauthorized sharing of course content</p>
                <p>• You can only access the course from the device where you made the purchase</p>
                {registeredDevice && (
                  <p>• Registered device ID: <Badge variant="outline" className="font-mono text-xs">{registeredDevice.slice(0, 16)}...</Badge></p>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Need Help?
              </h4>
              <p className="text-blue-700 text-sm mb-3">
                If you believe this is an error or you need to transfer your course to a new device, please contact our support team.
              </p>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/contact'}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default DeviceAccessGuard;