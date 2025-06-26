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
  const [maxWatchedTime, setMaxWatchedTime] = useState(0); // Track furthest point watched
  const progressUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const [isSeekingBlocked, setIsSeekingBlocked] = useState(false);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [canShowAlert, setCanShowAlert] = useState(true);

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
    if (playerRef.current && !isSeekingBlocked) {
      const currentTime = playerRef.current.currentTime;
      const videoDuration = playerRef.current.duration || duration;
      
      // Update max watched time only if user progresses forward naturally (not seeking)
      if (currentTime > maxWatchedTime) {
        setMaxWatchedTime(currentTime);
      }
      
      // Update progress every 10 seconds
      if (currentTime - lastUpdateTime >= 10) {
        updateProgress(currentTime, videoDuration);
        setLastUpdateTime(currentTime);
      }
    }
  };

  // Handle seeking attempts - COMPLETELY STRICT with controlled alerts
  const handleSeeking = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.currentTime;
      
      // STRICT RULE: No forward seeking allowed AT ALL
      if (currentTime > maxWatchedTime) {
        setIsSeekingBlocked(true);
        playerRef.current.currentTime = maxWatchedTime;
        
        // Show alert only once per seek attempt
        if (canShowAlert) {
          alert('Forward seeking is strictly prohibited! You can only rewind to previously watched content.');
          setCanShowAlert(false);
          
          // Reset alert availability after 5 seconds to prevent spam
          if (alertTimeoutRef.current) {
            clearTimeout(alertTimeoutRef.current);
          }
          alertTimeoutRef.current = setTimeout(() => {
            setCanShowAlert(true);
          }, 5000); // Increased from 1 second to 5 seconds
        }
        
        setTimeout(() => {
          setIsSeekingBlocked(false);
        }, 100);
      }
    }
  };

  // Additional event to catch seek attempts - NO ALERT HERE
  const handleSeeked = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.currentTime;
      
      // Double-check after seeking is complete - ONLY RESET POSITION, NO ALERT
      if (currentTime > maxWatchedTime) {
        setIsSeekingBlocked(true);
        playerRef.current.currentTime = maxWatchedTime;
        setTimeout(() => {
          setIsSeekingBlocked(false);
        }, 100);
      }
    }
  };

  const handleEnded = () => {
    if (playerRef.current) {
      const videoDuration = playerRef.current.duration || duration;
      updateProgress(videoDuration, videoDuration, true);
      setMaxWatchedTime(videoDuration); // Mark entire video as watched
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

  // Load user's previous progress on component mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!userId) return;
      
      try {
        const response = await axios.get(`/api/courses/${courseId}/sections/${sectionId}/progress`);
        if (response.data && response.data.lastWatchedPosition) {
          setMaxWatchedTime(response.data.lastWatchedPosition);
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    };

    loadProgress();

    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, [userId, courseId, sectionId]);

  return (
    <MuxPlayer
      ref={playerRef}
      playbackId={playbackId}
      className={className}
      onLoadedMetadata={handleLoadedMetadata}
      onTimeUpdate={handleTimeUpdate}
      onSeeking={handleSeeking}
      onSeeked={handleSeeked}
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