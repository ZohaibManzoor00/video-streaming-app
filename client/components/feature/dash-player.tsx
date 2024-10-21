'use client'

import React, { useEffect, useRef } from 'react';
import dashjs from 'dashjs';

interface DashPlayerProps {
  url: string; // URL to the DASH manifest file (.mpd)
}

const DashPlayer: React.FC<DashPlayerProps> = ({ url }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && url) {
      // Initialize the dash.js player
      const player = dashjs.MediaPlayer().create();
      player.initialize(videoRef.current, url, true);

      player.on(dashjs.MediaPlayer.events.ERROR, (e) => {
        console.error('DASH.js Error:', e);
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
        style={{ width: '100%', maxWidth: '800px' }}
      />
    </div>
  );
};

export default DashPlayer;
