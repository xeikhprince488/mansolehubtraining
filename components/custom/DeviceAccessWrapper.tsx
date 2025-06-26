'use client';

import { useDeviceAccess } from "@/hooks/useDeviceAccess";
import DeviceAccessGuard from "@/components/custom/DeviceAccessGuard";
import SectionsDetails from "@/components/sections/SectionsDetails";
import { db } from "@/lib/db";
import { useEffect, useState } from "react";

interface DeviceAccessWrapperProps {
  courseId: string;
  courseName: string;
  purchase: any;
  course: any;
  section: any;
  userId: string;
  sectionId: string;
}

const DeviceAccessWrapper = ({
  courseId,
  courseName,
  purchase,
  course,
  section,
  userId,
  sectionId
}: DeviceAccessWrapperProps) => {
  const { hasAccess, isLoading, error, registeredDevice } = useDeviceAccess(courseId);
  const [muxData, setMuxData] = useState(null);
  const [resources, setResources] = useState([]);
  const [progress, setProgress] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (purchase) {
        try {
          const [muxResponse, resourcesResponse, progressResponse] = await Promise.all([
            fetch(`/api/sections/${sectionId}/mux`),
            fetch(`/api/sections/${sectionId}/resources`),
            fetch(`/api/progress/${userId}/${sectionId}`)
          ]);

          const muxResult = muxResponse.ok ? await muxResponse.json() : null;
          const resourcesResult = resourcesResponse.ok ? await resourcesResponse.json() : [];
          const progressResult = progressResponse.ok ? await progressResponse.json() : null;

          setMuxData(muxResult);
          setResources(resourcesResult);
          setProgress(progressResult);
        } catch (error) {
          console.error('Error fetching section data:', error);
        }
      }
      setDataLoading(false);
    };

    fetchData();
  }, [purchase, sectionId, userId]);

  if (dataLoading) {
    return <div>Loading section data...</div>;
  }

  return (
    <DeviceAccessGuard
      hasAccess={hasAccess && !!purchase}
      isLoading={isLoading}
      error={!purchase ? 'Course not purchased' : error}
      registeredDevice={registeredDevice}
      courseTitle={courseName}
    >
      <SectionsDetails 
        course={course}
        section={section}
        purchase={purchase}
        muxData={muxData}
        resources={resources}
        progress={progress}
      />
    </DeviceAccessGuard>
  );
};

export default DeviceAccessWrapper;