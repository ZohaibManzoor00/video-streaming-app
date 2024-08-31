export default async function Home() {
  return (
    <div className="px-3">
      <div className="text-5xl">Home page</div>
      <h1>Add BG Video</h1>
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Necessitatibus
        voluptates accusamus laudantium unde atque repellat dolores tenetur
        placeat reprehenderit facilis, excepturi minus voluptatem, sequi hic
        architecto delectus! Dolorum, maxime exercitationem!
      </p>
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
