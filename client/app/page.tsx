import Link from "next/link";
import { getVideos } from "./firebase/functions";

interface Video {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed";
  title?: string;
  description?: string;
}

export default async function Home() {
  const videos = await getVideos(); // Fetching data directly

  return (
    <main className="px-5 pt-10">
      <p>Home Page</p>
      <div className="">
        {videos.map((video: Video) => (
          <div className="border border-red-900 my-4" key={video.id}>
            <Link href={`/watch?v=${video.filename}`}>
              <div className="py-4 text-lg flex justify-center">
                Watch Video!
              </div>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
