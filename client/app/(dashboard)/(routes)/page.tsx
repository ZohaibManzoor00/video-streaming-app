import Link from "next/link";
import { getVideos } from "../../firebase/functions";
import Image from "next/image";

interface Video {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed";
  title?: string;
  description?: string;
}

export default async function Home() {
  const videos = await getVideos();

  return (
    <main className="px-5 pt-10 bg-zinc-800">
      <p>Home Page</p>
      {videos.map((video: Video) => (
        <div className="flex justify-center gap-x-2" key={video.id}>
          <Link href={`/trial_delete_later?v=${video.filename}`} className="border">
            <Image
              src={"/marcy-logo.png"}
              alt="Video Thumbnail"
              width={120}
              height={80}
            />
          </Link>
        </div>
      ))}
    </main>
  );
}
