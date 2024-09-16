"use client";

import { useSearchParams } from "next/navigation";

export default function VideoPlayer() {
  const videoPrefix =
    "https://storage.googleapis.com/marcy-yt-processed-videos/";
  const videoSrc = useSearchParams().get("v");

  if (!videoSrc) return <div>Not Found</div>;

  return (
    <video
      className="h-full w-full object-contain"
      controls
      src={videoPrefix + videoSrc}
    />
  );
}
