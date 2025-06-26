"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

interface VideoPlayerProps {
  playbackId: string;
  className?: string;
  courseId: string;
  sectionId: string;
  onProgressUpdate?: (progress: any) => void;
}

const VideoPlayer = ({ 
  playbackId, 
  className, 
  courseId, 
  sectionId, 
  onProgressUpdate 
}: VideoPlayerProps) => {
  const { userId } = useAuth();
  const playerRef = useRef<any>(null);
  const [duration, setDuration] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const progressUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Update progress every 10 seconds while watching
  const updateProgress = async (currentTime: number, videoDuration: number, isCompleted: boolean = false) => {
    if (!userId || !currentTime || !videoDuration) return;

    const watchPercentage = Math.min((currentTime / videoDuration) * 100, 100);
    
    try {
      const response = await axios.post(`/api/courses/${courseId}/sections/${sectionId}/progress`, {
        watchTimeSeconds: Math.floor(currentTime),
        videoDurationSeconds: Math.floor(videoDuration),
        watchPercentage: Math.round(watchPercentage * 100) / 100,
        lastWatchedPosition: Math.floor(currentTime),
        isCompleted: isCompleted || watchPercentage >= 90, // Auto-complete at 90%
        lastWatchedAt: new Date().toISOString()
      });
      
      if (onProgressUpdate) {
        onProgressUpdate(response.data);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleLoadedMetadata = () => {
    if (playerRef.current) {
      const videoDuration = playerRef.current.duration;
      setDuration(videoDuration);
    }
  };

  const handleTimeUpdate = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.currentTime;
      const videoDuration = playerRef.current.duration || duration;
      
      // Update progress every 10 seconds
      if (currentTime - lastUpdateTime >= 10) {
        updateProgress(currentTime, videoDuration);
        setLastUpdateTime(currentTime);
      }
    }
  };

  const handleEnded = () => {
    if (playerRef.current) {
      const videoDuration = playerRef.current.duration || duration;
      updateProgress(videoDuration, videoDuration, true);
    }
  };

  const handlePlay = () => {
    // Start periodic updates when video plays
    if (progressUpdateInterval.current) {
      clearInterval(progressUpdateInterval.current);
    }
    
    progressUpdateInterval.current = setInterval(() => {
      if (playerRef.current && !playerRef.current.paused) {
        const currentTime = playerRef.current.currentTime;
        const videoDuration = playerRef.current.duration || duration;
        updateProgress(currentTime, videoDuration);
      }
    }, 15000); // Update every 15 seconds
  };

  const handlePause = () => {
    // Clear interval when paused
    if (progressUpdateInterval.current) {
      clearInterval(progressUpdateInterval.current);
      progressUpdateInterval.current = null;
    }
    
    // Update progress when paused
    if (playerRef.current) {
      const currentTime = playerRef.current.currentTime;
      const videoDuration = playerRef.current.duration || duration;
      updateProgress(currentTime, videoDuration);
    }
  };

  useEffect(() => {
    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    };
  }, []);

  return (
    <MuxPlayer
      ref={playerRef}
      playbackId={playbackId}
      className={className}
      onLoadedMetadata={handleLoadedMetadata}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
      onPlay={handlePlay}
      onPause={handlePause}
      metadata={{
        video_title: `Course ${courseId} - Section ${sectionId}`,
        viewer_user_id: userId || 'anonymous'
      }}
    />
  );
};

export default VideoPlayer;