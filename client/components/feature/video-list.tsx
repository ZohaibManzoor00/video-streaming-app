"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
// import dynamic from "next/dynamic";

import { Video } from "@/firebase/videos";
import { formatDuration } from "@/lib/format-video-duration";
// const DashPlayer = dynamic(() => import("./hover-dash-player"), { ssr: false });

interface VideosListProps {
  videos: Video[];
}

export default function VideosList({ videos }: VideosListProps) {
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (videoId: string) => {
    hoverTimeoutRef.current = setTimeout(() => setHoveredVideoId(videoId), 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredVideoId(null);
  };

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {videos.map((video) => {
        const thumbnailUrl = `https://storage.googleapis.com/marcy-yt-processed-videos/${video.id}/thumbnail.jpg`;
        const videoUrl = `https://storage.googleapis.com/marcy-yt-processed-videos/${video.id}/manifest.mpd`;
        const isHovered = hoveredVideoId === video.id;

        return (
          <li key={video.id} className="cursor-pointer flex justify-center transition-transform transform hover:scale-105">
            <Link href={`/watch?v=${video.id}`}>
              <div
                onMouseEnter={() => handleMouseEnter(video.id ?? "")}
                onMouseLeave={handleMouseLeave}
                className="relative w-[300px] h-[170px] aspect-video bg-gray-200 overflow-hidden rounded-md"
              >
                <Image
                  src={thumbnailUrl}
                  alt={`Thumbnail for video ${video.id}`}
                  fill
                  sizes=""
                  className={`object-fill absolute inset-0 ${
                    isHovered ? "opacity-0" : "opacity-100"
                  } transition-opacity duration-200`}
                />
                {/* <div
                  className={`absolute inset-0 ${
                    isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                  } transition-opacity duration-200`}
                >
                  <DashPlayer
                    url={videoUrl}
                    isPlaying={isHovered}
                    muted={true}
                    className="w-full h-full object-contain"
                  />
                </div> */}
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                  {formatDuration(String(video?.duration))}
                </div>
              </div>
              <div className="flex mt-2">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 bg-gray-400 rounded-full" />
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-bold dark:text-gray-200 text-black line-clamp-2">{video?.id ?? "Video Title Placeholder"}</p>
                  <p className="text-sm text-gray-500">{"Channel Name Placeholder"}</p>
                  <p className="text-sm text-gray-500">{video?.viewCount ?? 0} views • {"1 day ago"}</p>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
