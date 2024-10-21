import { getImages } from "@/firebase/images";
import { getVideos } from "@/firebase/videos";
import UploadVideo from "@/components/feature/upload-video";
import VideosList from "@/components/feature/video-list";

import dynamic from 'next/dynamic';
const DashPlayer = dynamic(() => import('@/components/feature/dash-player'), { ssr: false });


export default async function FeaturePage() {
  const [videos, images] = await Promise.all([getVideos(), getImages()]);
  const dashManifestUrl = 'https://storage.googleapis.com/marcy-yt-processed-videos/200w%282%29/manifest.mpd';

  return (
    <>
      {/* <div className="flex gap-x-5">
        <UploadVideo />
      </div>

      <div className="w-1/6 mx-auto">
        <VideosList videos={videos} />
      </div> */}
        <DashPlayer url={dashManifestUrl} />
    </>
  );
}