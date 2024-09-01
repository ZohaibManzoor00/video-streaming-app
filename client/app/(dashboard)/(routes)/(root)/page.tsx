import CallToActionButtons from "../../_components/call-to-action-buttons";

export default function Home() {
  return (
    <div className="text-white">
      <div className="relative h-[400px] overflow-hidden">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="/intro-video.mp4"
          autoPlay
          loop
          muted
        />

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none dot-grid" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-5xl font font-extrabold mt-4">
            Your Path to Fullstack Dev and Beyond
          </h1>
          <h1 className="mt-4 mb-3 text-2xl font-bold">
            In-Depth Frontend, Backend, and Fullstack Courses
          </h1>
          <CallToActionButtons />
        </div>
      </div>
      <div className="text-center">
        <h1 className="mt-20 text-4xl mb-2">
          Gain Practical Tech Skills from Experts You Can Trust
        </h1>
        <p className="text-lg">
          JavaScript, React, OOP, DSA and Backend (Express, SQL, PostgreSQL, &
          More)
        </p>
      </div>
    </div>
  );
}

// import Link from "next/link";
// import { getImages, getVideos } from "../../firebase/functions";
// import Image from "next/image";

// interface Video {
//   id?: string;
//   uid?: string;
//   filename?: string;
//   status?: "processing" | "processed";
//   title?: string;
//   description?: string;
// }

// interface Image {
//   id?: string;
//   uid?: string;
//   filename?: string;
//   status?: "processing" | "processed";
//   title?: string;
//   description?: string;
// }

// export default async function Home() {
//   const [videos, images] = await Promise.all([getVideos(), getImages()]);

//   return (
//     <main className="px-5 pt-10 bg-zinc-800 flex">
//       <p>Home Page</p>
//       {videos.map((video: Video) => (
//         <div className="flex justify-center gap-x-2" key={video.id}>
//           <Link
//             href={`/trial_delete_later?v=${video.filename}`}
//             className="border"
//           >
//             <Image
//               src={"/marcy-logo.png"}
//               alt="Video Thumbnail"
//               width={120}
//               height={80}
//             />
//           </Link>
//         </div>
//       ))}
//       {images.map((image: Image) => (
//         <div className="flex justify-center gap-x-2" key={image.id}>
//           <Link
//             href={`/see_images?v=${image.filename}`}
//             className="border"
//           >
//             Check out this image called {image.filename}
//           </Link>
//         </div>
//       ))}
//     </main>
//   );
// }
