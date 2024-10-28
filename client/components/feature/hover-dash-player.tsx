// DashPlayer.jsx
"use client";
import React, { useEffect, useRef } from "react";
import dashjs from "dashjs";

interface DashPlayerProps {
  url: string;
  isPlaying: boolean;
  muted?: boolean;
  className?: string;
}

const DashPlayer: React.FC<DashPlayerProps> = ({
  url,
  isPlaying,
  muted = false,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<dashjs.MediaPlayerClass | null>(null);

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      const player = dashjs.MediaPlayer().create();
      player.initialize(videoRef.current, url, false);
      if (muted) videoRef.current.muted = true;
      playerRef.current = player;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.reset();
        playerRef.current = null;
      }
    };
  }, [url, muted]);

  useEffect(() => {
    if (videoRef.current) isPlaying ? videoRef.current.play() : videoRef.current.pause();
  }, [isPlaying]);

  return (
    <video
      ref={videoRef}
      controls={false}
      className={`w-full h-full object-contain ${className}`}
    />
  );
};

export default DashPlayer;
