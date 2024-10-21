import dynamic from 'next/dynamic';
const DashPlayer = dynamic(() => import('@/components/feature/dash-player'), { ssr: false });

export default function WatchPage() {
  // const dashManifestUrl = 'https://storage.googleapis.com/marcy-yt-processed-videos/test1/manifest.mpd';
  // const videoPrefix =
  // "https://storage.googleapis.com/marcy-yt-processed-videos/";

  return (
    <div className='flex justify-center'>
      <DashPlayer />
    </div>
  );
}
