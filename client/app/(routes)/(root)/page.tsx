import Image from "next/image";
import CallToActionButtons from "../_components/call-to-action-buttons";
import DailyMessage from "../_components/daily-message";

export default function Home() {
  return (
    <>
      <div className="relative h-[400px] overflow-hidden">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="/intro-video.mp4"
          // autoPlay
          loop
          muted
        />

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none dot-grid" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 text-slate-200">
          <h1 className="text-5xl font font-medium mt-4">
            Your Path to Fullstack Dev and Beyond
          </h1>
          <h1 className="mt-4 mb-3 text-2xl">
            In-Depth Frontend, Backend, and Fullstack Courses
          </h1>
          <CallToActionButtons />
        </div>
      </div>
      <div className="relative flex justify-center max-w-5xl mx-auto">
        <div className="absolute -top-8 bg-gray-900 opacity-80 py-5 px-8 w-3/4">
          <DailyMessage />
        </div>
      </div>
      <div className="text-center px-4 text-white">
        <h1 className="mt-24 text-4xl mb-2">
          Gain Practical Tech Skills from Experts You Can Trust
        </h1>
        <p className="text-lg">
          JavaScript, React, OOP, DSA and Backend (Express, SQL, PostgreSQL, &
          More)
        </p>
        <ul className="flex flex-wrap justify-center pt-14 gap-10">
          {/* TODO: Switch to tech logos */}
          {Array.from({ length: 8 }).map((_, idx) => (
            <li key={idx}>
              <Image
                src="/javascript-logo.png"
                width={80}
                height={80}
                alt="tech image"
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-20 bg-stone-900">
        <div>
          <div className="lg:grid grid-cols-2 py-12 place-content-center place-items-center max-w-6xl mx-auto sm:flex sm:flex-wrap-reverse">
            <div className="text-white space-y-3 px-6">
              <h1 className="text-3xl font-medium">
                Learn From the Best Educators
              </h1>
              <p className="text-lg opacity-90 pb-2">
                At The Marcy Lab School, we pride ourselves on offering
                Fullstack Software Engineering courses completely free, thanks
                to our sponsors such as JP.Morgan Chase, Spotify, Google, and
                Mizuho. Our curriculum is continually evolving to align with the
                most recent advancements, guaranteeing that our fellows are
                equipped with industry-standard best practices and cutting-edge
                techniques.
              </p>
              <CallToActionButtons priorityStyles={"justify-start"} />
            </div>
            <div>
              <Image
                src="/marcy-founders.png"
                width={500}
                height={100}
                alt="tech image"
              />
            </div>
          </div>
          <ul className="flex justify-evenly mx-auto pb-16 max-w-6xl px-6">
            {[
              { label: "In-Depth Courses", value: "200+" },
              { label: "Learning Paths", value: "4" },
              { label: "Industry Leading Experts", value: "⭐" },
              { label: "Live Interactive Workshops", value: "💥" },
            ].map(({ label, value }) => (
              <li key={label} className="max-w-44">
                {/* TODO: Move to client component and pull in colors */}
                <div className="text-6xl text-center bg-gradient-to-r from-red-700 to-yellow-500 bg-clip-text text-transparent">
                  {value}
                </div>
                <div className="text-xl font-medium text-center text-white opacity-80">
                  {label}
                </div>
              </li>
            ))}
          </ul>
          {/* DELETE */}
          <div className="my-96" />
        </div>
      </div>
    </>
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
