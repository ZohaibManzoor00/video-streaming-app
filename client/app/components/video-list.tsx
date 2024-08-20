import Link from "next/link";
import { getVideos } from "../firebase/functions";

export async function VideosList() {
  const videos = await getVideos();

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

export const revalidate = 10; // rerender every 30 sec
