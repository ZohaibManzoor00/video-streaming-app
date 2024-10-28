// "use client";

// import React, { useEffect, useRef } from "react";
// import dashjs from "dashjs";
// import { useSearchParams } from "next/navigation";

// interface DashPlayerProps {
//   url?: string;
// }

// const DashPlayer: React.FC<DashPlayerProps> = () => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const videoSrc = useSearchParams().get("v");


//   const url = `https://storage.googleapis.com/marcy-yt-processed-videos/${videoSrc}/manifest.mpd`;

//   useEffect(() => {
//     if (videoRef.current && url) {
//       // Initialize the dash.js player
//       const player = dashjs.MediaPlayer().create();

//       // Configure adaptive bitrate (ABR) settings
//       player.updateSettings({
//         streaming: {
//           abr: {
//             autoSwitchBitrate: {
//               video: true, // Allow automatic bitrate switching
//             },
//             initialBitrate: {
//               video: 3000, // Set an initial bitrate (in kbps)
//             },
//             limitBitrateByPortal: true, // Limit bitrate based on player size (useful for mobile devices)
//           },
//           buffer: {
//             stableBufferTime: 30, // Buffer time to reach stable playback (in seconds)
//             bufferTimeAtTopQuality: 60, // Buffer time for the top quality (in seconds)
//             bufferTimeAtTopQualityLongForm: 120, // Longer buffer for long-form content
//           },
//         },
//       });

//       // Initialize the player with the given URL
//       player.initialize(videoRef.current, url, true);

//       player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, (e) => {
//         console.log('Quality changed to:', e.newQuality);
//       });

//       // Handle player errors
//       player.on(dashjs.MediaPlayer.events.ERROR, (e) => {
//         console.error("DASH.js Error:", e);
//         // Optional: Display a user-friendly message or retry logic
//       });

//       // Cleanup the player on component unmount
//       return () => {
//         player.reset();
//       };
//     }
//   }, [url]);

//   if (!videoSrc) return <div>Not Found</div>;

//   return (
//     <div>
//       <video
//         ref={videoRef}
//         controls
//         style={{ width: "100%", maxWidth: "800px" }}
//       />
//     </div>
//   );
// };

// export default DashPlayer;
"use client";

import React, { useEffect, useRef, useState } from "react";
import dashjs from "dashjs";
import { useSearchParams } from "next/navigation";
import { handlePlay } from "@/firebase/videos";

// Extend Navigator and NetworkInformation interfaces
declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }

  interface NetworkInformation {
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  }
}

const DashPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<dashjs.MediaPlayerClass | null>(null);
  const [availableQualities, setAvailableQualities] = useState<dashjs.BitrateInfo[]>([]);
  const [selectedQualityIndex, setSelectedQualityIndex] = useState<number>(-1); // -1 for auto quality
  const [viewIncremented, setViewIncremented] = useState(false)

  const searchParams = useSearchParams();
  const videoId = searchParams.get("v") || '';

  if (!videoId) return <div>Not Found</div>;

  const url = `https://storage.googleapis.com/marcy-yt-processed-videos/${videoId}/manifest.mpd`;

  // Define event handlers
  const onStreamInitialized = () => {
    if (playerRef.current) {
      const bitrates = playerRef.current.getBitrateInfoListFor('video');
      setAvailableQualities(bitrates);
    }
  };

  const onQualityChangeRendered = (e: dashjs.QualityChangeRenderedEvent) => {
    console.log('Quality changed to:', e.newQuality);
  };

  const onError = (e: dashjs.ErrorEvent) => {
    console.error("DASH.js Error:", e);
  };

  useEffect(() => {
    if (videoRef.current && url) {
      const player = dashjs.MediaPlayer().create();
      playerRef.current = player;

      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      let initialBitrate = 3000; // Default initial bitrate in kbps

      if (connection && connection.effectiveType) {
        switch (connection.effectiveType) {
          case 'slow-2g':
          case '2g':
            initialBitrate = 250;
            break;
          case '3g':
            initialBitrate = 750;
            break;
          case '4g':
            initialBitrate = 3000;
            break;
          default:
            initialBitrate = 1500;
        }
      }

      // Configure player settings
      player.updateSettings({
        streaming: {
          abr: {
            autoSwitchBitrate: {
              video: selectedQualityIndex === -1, // Enable auto-switch when index is -1
            },
            initialBitrate: {
              video: initialBitrate,
            },
            useDefaultABRRules: true,
            bandwidthSafetyFactor: 0.8,
            limitBitrateByPortal: true, // Adjust bitrate based on player size
          },
          buffer: {
            fastSwitchEnabled: true,
            stableBufferTime: 20,
            bufferTimeAtTopQuality: 30,
            bufferTimeAtTopQualityLongForm: 60,
            initialBufferLevel: 10,
          },
        },
      });

      // Initialize the player with the given URL
      player.initialize(videoRef.current, url, true);

      // Attach event listeners
      player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, onStreamInitialized);
      player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, onQualityChangeRendered);
      player.on(dashjs.MediaPlayer.events.ERROR, onError);

      // Cleanup the player on component unmount
      return () => {
        player.off(dashjs.MediaPlayer.events.STREAM_INITIALIZED, onStreamInitialized);
        player.off(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, onQualityChangeRendered);
        player.off(dashjs.MediaPlayer.events.ERROR, onError);
        player.reset();
        playerRef.current = null;
      };
    }
  }, [url, selectedQualityIndex]); // Added selectedQualityIndex to dependencies

  // Handle quality selection changes
  useEffect(() => {
    if (playerRef.current) {
      if (selectedQualityIndex >= 0) {
        // Set manual quality
        playerRef.current.updateSettings({
          streaming: {
            abr: {
              autoSwitchBitrate: {
                video: false,
              },
            },
          },
        });
        playerRef.current.setQualityFor('video', selectedQualityIndex);
      } else {
        // Enable auto quality switching
        playerRef.current.updateSettings({
          streaming: {
            abr: {
              autoSwitchBitrate: {
                video: true,
              },
            },
          },
        });
      }
    }
  }, [selectedQualityIndex]);

  const handlePlayEvent = () => {
    if (!viewIncremented) {
      handlePlay(videoId);
      setViewIncremented(true);
    }
  };


  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <video
        onPlay={handlePlayEvent}
        ref={videoRef}
        controls
        style={{ width: '100%' }}
      />
      {availableQualities.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <label htmlFor="quality-select">Quality:</label>
          <select
            id="quality-select"
            value={selectedQualityIndex}
            onChange={(e) => setSelectedQualityIndex(Number(e.target.value))}
          >
            <option value={-1}>Auto</option>
            {availableQualities.map((quality, index) => (
              <option key={index} value={index}>
                {Math.round(quality.bitrate / 1000)} kbps
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default DashPlayer;
