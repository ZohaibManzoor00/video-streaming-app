"use client";
import { DynamicBorder } from "@/components/dynamic-wrappers";
import Link from "next/link";

interface Video {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed";
  title?: string;
  description?: string;
}

interface VideosListProps {
  videos: Video[];
}

export default function VideosList({ videos }: VideosListProps) {
  const handleDelete = () => {};

  return (
    <ul className="flex flex-col gap-y-4">
      {videos.map((video) => (
        <li key={video.id}>
          <DynamicBorder styles="text-slate-200 text-center">
            <Link href={`/chapter?v=${video.filename}`}>
              <button className="py-4 text-lg">Watch Video!</button>
            </Link>
            <button onClick={handleDelete}>Delete</button>
          </DynamicBorder>
        </li>
      ))}
    </ul>
  );
}
