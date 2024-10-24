"use client";
import Link from "next/link";

type Video = {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed" | "failed";
  progress?:
    | "initializing"
    | "downloading"
    | "processing"
    | "uploading"
    | "complete";
};

interface VideosListProps {
  videos: Video[];
}

export default function VideosList({ videos }: VideosListProps) {
  const handleDelete = () => {};

  return (
    <ul className="flex flex-col gap-y-4">
      {videos.map((video) => (
        <li key={video.id}>
            <Link href={`/watch?v=${video.id}`}>
              <button className="py-4 text-lg">Watch Video: {video.id}</button>
            </Link>
            {/* <button onClick={handleDelete}>Delete</button> */}
        </li>
      ))}
    </ul>
  );
}
