import VideoPlayer from "../_components/video-player";

export default function ChapterPage() {
  return (
    <div className="max-w-7xl px-6 mx-auto min-h-screen">
      <p className="text-slate-200">Hope you enjoy this video!</p>
      <div className="h-1/6 w-1/6"><VideoPlayer /></div>
    </div>
  );
}
