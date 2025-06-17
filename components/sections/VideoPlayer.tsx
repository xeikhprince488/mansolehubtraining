"use client";

import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
  playbackId: string;
  className?: string;
}

const VideoPlayer = ({ playbackId, className }: VideoPlayerProps) => {
  return (
    <MuxPlayer
      playbackId={playbackId}
      className={className}
    />
  );
};

export default VideoPlayer;