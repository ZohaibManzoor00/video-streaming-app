import { VideosList } from "./components/video-list";

export default function Home() {
  return (
    <main className="px-5 pt-10">
      <p>Home Page</p>
      <div className="">
        <VideosList />
      </div>
    </main>
  );
}
