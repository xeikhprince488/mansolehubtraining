import { useEffect, useState } from 'react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

export const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Call>();
  const [isCallLoading, setIsCallLoading] = useState(true);

  const client = useStreamVideoClient();

  useEffect(() => {
    if (!client) return;
    
    const loadCall = async () => {
      try {
        const { calls } = await client.queryCalls({
          filter_conditions: { id }
        });

        if (calls.length > 0) {
          setCall(calls[0]);
        } else {
          // Create a new call if it doesn't exist
          const newCall = client.call('default', id as string);
          await newCall.getOrCreate();
          setCall(newCall);
        }
      } catch (error) {
        console.error('Error loading call:', error);
      } finally {
        setIsCallLoading(false);
      }
    };

    loadCall();
  }, [client, id]);

  return { call, isCallLoading };
};