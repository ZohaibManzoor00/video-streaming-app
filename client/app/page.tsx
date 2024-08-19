import Link from "next/link";
import { getVideos } from "./firebase/functions";

export default async function Home() {
  const videos = await getVideos();

  return (
    <main>
      {videos.map((video) => (
        <Link href={`/watch?v=${video.filename}`} key={video.id}>
          <div className="p-10 text-lg">Watch Video!</div>
        </Link>
      ))}
    </main>
  );
}

export const revalidate = 30; // rerender every 30 sec
