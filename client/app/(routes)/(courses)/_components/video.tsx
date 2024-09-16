"use client";

import { deleteVideo } from "@/app/firebase/videos";
import { DynamicBorder } from "@/components/dynamic-wrappers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

type Video = {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed" | "failed" | "pending";
  title?: string;
  description?: string;
};

export default function VideoWatcher({ video }: { video: Video }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!video.id || !video.filename) return;

    try {
      setIsDeleting(true);
      console.log("deleting");
      await deleteVideo(video?.id, video.filename);
      setIsDeleting(true);
      router.refresh();
    } catch (err) {
      console.error("Error deleting video");
    }
  };

  return (
    <>
      <DynamicBorder styles="text-slate-200 text-center h-28">
        {video.status === "processed" ? (
          <>
            <Link href={`/chapter?v=${video.filename}`}>
              <button className="py-4 text-lg">Watch Video!</button>
            </Link>
            <button disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </>
        ) : (
          <p>Processing Your video...</p> // TODO: Stays on processing, needs to update
        )}
      </DynamicBorder>
    </>
  );
}
