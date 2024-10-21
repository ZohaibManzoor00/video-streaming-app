import { getImages } from "@/firebase/images";
import { getVideos } from "@/firebase/videos";
import UploadVideo from "@/components/feature/upload-video";
import VideosList from "@/components/feature/video-list";


export default async function FeaturePage() {
  const [videos, images] = await Promise.all([getVideos(), getImages()]);

  return (
    <div className="flex justify-center">
      {/* <div className="flex gap-x-5">
        <UploadVideo />
      </div>*/}

      <div className="w-1/6 mx-auto">
        <VideosList videos={videos} />
      </div> 
    </div>
  );
}