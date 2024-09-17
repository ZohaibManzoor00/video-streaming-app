import Image from "next/image";
import Link from "next/link";
import UploadVideo from "../_components/upload-video";
import UploadImage from "../_components/upload-image";
import { getImages } from "@/app/firebase/images";
import { getVideos } from "@/app/firebase/videos";
import VideosList from "../_components/video-list";

export default async function CoursesPage() {
  const [videos, images] = await Promise.all([getVideos(), getImages()]);

  return (
    <>
      <div className="flex gap-x-5">
        <UploadVideo />
        {/* <UploadImage /> */}
      </div>

      <div className="w-1/6 mx-auto">
        <VideosList videos={videos} />
      </div>
    </>
  );

  // return (
  //   <div className="mt-20 mx-auto max-w-7xl px-6">
  //     <div className="text-slate-100 text-center">
  //       <h1 className="text-5xl font-medium">
  //         Frontend & Fullstack Engineering Courses
  //       </h1>
  //       <div className="flex gap-x-1 justify-center mt-4 text-lg">
  //         <p>Not sure where to start?</p>
  //         <Link href="/learn" className="text-rose-700">
  //           Check out our learning Paths!
  //         </Link>
  //       </div>
  //     </div>
  //     <div className="mt-10">
  //       <form className="relative">
  //         <input
  //           type="search"
  //           // value={"'searchTerm'"}
  //           placeholder="Search for a course, language, framework, or teacher..."
  //           className="pl-14 text-lg py-3 w-full rounded-full border outline-black outline-8"
  //         />
  //         <svg
  //           xmlns="http://www.w3.org/2000/svg"
  //           className="h-6 w-6 absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400"
  //           fill="none"
  //           viewBox="0 0 24 24"
  //           stroke="currentColor"
  //         >
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             strokeWidth="2"
  //             d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
  //           />
  //         </svg>
  //       </form>
  //     </div>
  //     {/* <Image
  //           src="/marcy-founders.png"
  //           width={600}
  //           height={400}
  //           alt="course image"
  //           className="opacity-50 object-contain"
  //         /> */}
  //     <ul className="my-10 grid sm:grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
  //       {Array.from({ length: 6 }).map((_, idx) => (
  //         <li key={idx} className="relative cursor-pointer">
  //           <div className="h-[340px] flex opacity-70 hover:opacity-100 transition-opacity duration-300">
  //             <div className="w-full h-full bg-indigo-900"></div>
  //             <div className="w-full h-full bg-gradient-to-l from-stone-950 to-stone-900" />
  //           </div>
  //           <div className="h-[5px] w-full bg-slate-600" />
  //           <div className="absolute top-0 left-12 h-full p-4">
  //             <h1 className="text-2xl text-rose-800">
  //               Javascript Basics, v{idx - 1}
  //             </h1>
  //             <div className="flex items-center gap-x-3">
  //               <div className="h-16 w-16 bg-black rounded-full" />
  //               <p className="text-lg text-slate-100">Zohaib Manzoor</p>
  //             </div>
  //             <p className="text-slate-100 my-2">
  //               Take your first steps into the wide world of JavaScript and walk
  //               away with the core skills needed to become a professional
  //               JavaScript programmer!
  //             </p>
  //             <p className="text-slate-100 opacity-60">
  //               {14} hours, 20 minutes
  //             </p>
  //             <br />
  //             <button className="py-3 bg-red-900 rounded-full min-w-40 text-slate-200">
  //               Course Details
  //             </button>
  //           </div>
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );
}
