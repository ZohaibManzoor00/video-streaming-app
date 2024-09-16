import VideoWatcher from "./video";

type Video = {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed" | "failed" | "pending";
  title?: string;
  description?: string;
};

type VideosListProps = {
  videos: Video[];
};

export default function VideosList({ videos }: VideosListProps) {

  return (
    <ul className="flex flex-col gap-y-4">
      {videos.map((video) => (
        <li key={video.id}>
          <VideoWatcher video={video} />
        </li>
      ))}
    </ul>
  );
}
