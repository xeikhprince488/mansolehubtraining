
'use client'
import { useState, useEffect } from 'react';
import { generateDeviceFingerprint } from '@/lib/deviceFingerprint';
import axios from 'axios';

interface DeviceAccessState {
  isLoading: boolean;
  hasAccess: boolean;
  deviceFingerprint: string | null;
  error: string | null;
  registeredDevice: string | null;
}

export const useDeviceAccess = (courseId: string) => {
  const [state, setState] = useState<DeviceAccessState>({
    isLoading: true,
    hasAccess: false,
    deviceFingerprint: null,
    error: null,
    registeredDevice: null,
  });

  useEffect(() => {
    const checkDeviceAccess = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Generate device fingerprint
        const { fingerprint, deviceInfo } = await generateDeviceFingerprint();
        
        // Check purchase status with device validation
        const response = await axios.get(
          `/api/courses/${courseId}/purchase-status?deviceFingerprint=${fingerprint}`
        );
        
        const { hasPurchase, hasDeviceAccess, deviceAccessInfo, purchase } = response.data;
        
        if (!hasPurchase) {
          setState({
            isLoading: false,
            hasAccess: false,
            deviceFingerprint: fingerprint,
            error: 'Course not purchased',
            registeredDevice: null,
          });
          return;
        }
        
        // Handle first-time device registration for new purchases
        if (purchase && !purchase.deviceFingerprint) {
          console.log('First-time device registration for purchase:', purchase.id);
          
          try {
            // Register device for the first time
            await axios.post('/api/device/register', {
              courseId,
              deviceFingerprint: fingerprint,
              deviceInfo,
            });
            
            setState({
              isLoading: false,
              hasAccess: true,
              deviceFingerprint: fingerprint,
              error: null,
              registeredDevice: fingerprint,
            });
            return;
          } catch (registerError) {
            console.error('Device registration failed:', registerError);
            setState({
              isLoading: false,
              hasAccess: false,
              deviceFingerprint: fingerprint,
              error: 'Failed to register device',
              registeredDevice: null,
            });
            return;
          }
        }
        
        // Handle existing device validation
        if (!hasDeviceAccess) {
          setState({
            isLoading: false,
            hasAccess: false,
            deviceFingerprint: fingerprint,
            error: 'Device not authorized for this course',
            registeredDevice: deviceAccessInfo?.registeredDevice || null,
          });
          return;
        }
        
        // Device is already registered and has access
        await axios.post('/api/device/register', {
          courseId,
          deviceFingerprint: fingerprint,
          deviceInfo,
        });
        
        setState({
          isLoading: false,
          hasAccess: true,
          deviceFingerprint: fingerprint,
          error: null,
          registeredDevice: deviceAccessInfo?.registeredDevice || fingerprint,
        });
      } catch (error) {
        console.error('Device access check failed:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to verify device access',
        }));
      }
    };
    
    if (courseId) {
      checkDeviceAccess();
    }
  }, [courseId]);
  
  return state;
};