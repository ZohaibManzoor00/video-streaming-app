"use client";

import React, { useEffect, useRef } from "react";
import dashjs from "dashjs";
import { useSearchParams } from "next/navigation";

interface DashPlayerProps {
  url?: string; // URL to the DASH manifest file (.mpd)
}

const DashPlayer: React.FC<DashPlayerProps> = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = useSearchParams().get("v");

  if (!videoSrc) return <div>Not Found</div>;

  const url = `https://storage.googleapis.com/marcy-yt-processed-videos/${videoSrc}/manifest.mpd`;

  useEffect(() => {
    if (videoRef.current && url) {
      // Initialize the dash.js player
      const player = dashjs.MediaPlayer().create();

      // Configure adaptive bitrate (ABR) settings
      player.updateSettings({
        streaming: {
          abr: {
            autoSwitchBitrate: {
              video: true, // Allow automatic bitrate switching
            },
            initialBitrate: {
              video: 3000, // Set an initial bitrate (in kbps)
            },
            limitBitrateByPortal: true, // Limit bitrate based on player size (useful for mobile devices)
          },
          buffer: {
            stableBufferTime: 30, // Buffer time to reach stable playback (in seconds)
            bufferTimeAtTopQuality: 60, // Buffer time for the top quality (in seconds)
            bufferTimeAtTopQualityLongForm: 120, // Longer buffer for long-form content
          },
        },
      });

      // Initialize the player with the given URL
      player.initialize(videoRef.current, url, true);

      player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, (e) => {
        console.log('Quality changed to:', e.newQuality);
      });

      // Handle player errors
      player.on(dashjs.MediaPlayer.events.ERROR, (e) => {
        console.error("DASH.js Error:", e);
        // Optional: Display a user-friendly message or retry logic
      });

      // Cleanup the player on component unmount
      return () => {
        player.reset();
      };
    }
  }, [url]);

  return (
    <div>
      <video
        ref={videoRef}
        controls
        style={{ width: "100%", maxWidth: "800px" }}
      />
    </div>
  );
};

export default DashPlayer;
