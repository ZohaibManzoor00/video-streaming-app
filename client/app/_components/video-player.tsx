"use client";

import { useSearchParams } from "next/navigation";

export default function VideoPlayer() {
  const videoPrefix =
    "https://storage.googleapis.com/marcy-yt-processed-videos/";
  const videoSrc = useSearchParams().get("v");

  if (!videoSrc) return <div>Not Found</div>;

  return (
    <div className="max-w-5xl">
      <video
        height={"full"}
        width={"full"}
        controls
        src={videoPrefix + videoSrc}
      />
    </div>
  );
}
