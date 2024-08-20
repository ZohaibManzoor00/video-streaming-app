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
  return (
    <div className="">
      {videos.map((video) => (
        <div className="border border-red-900 my-4" key={video.id}>
          <Link href={`/watch?v=${video.filename}`}>
            <div className="py-4 text-lg flex justify-center">Watch Video!</div>
          </Link>
        </div>
      ))}
    </div>
  );
}
