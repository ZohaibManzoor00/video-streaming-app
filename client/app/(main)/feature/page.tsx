import { getVideos } from "@/firebase/videos";
import UploadVideo from "@/components/feature/upload-video";
import VideosList from "@/components/feature/video-list";

export default async function FeaturePage() {
  const [videos] = await Promise.all([getVideos()]);

  return (
    <div className="px-4 max-w-7xl mx-auto">
    <VideosList videos={videos} />
    </div>
    // <div className="flex justify-center">
    //  <div className="flex gap-x-5">
    //   <UploadVideo />
    // </div>
    // </div>
  );
}
