"use client";

import { useSearchParams } from "next/navigation";

export default function Watch() {
  const videoPrefix =
    "https://storage.googleapis.com/marcy-yt-processed-videos/";
  const videoSrc = useSearchParams().get("v");

  return (
    <div>
      <h1>Watch Page</h1>
      <div className="max-w-5xl">
        {<video height={'full'} width={'full'} controls src={videoPrefix + videoSrc} />}
      </div>
    </div>
  );
}
// 'use client'

// import SignIn from "../components/sign-in";
// import UploadVideo from "../components/upload-video";
// import useUser from "../hooks/setUser";

// export default function Watch() {
//   const { user } = useUser()

//   return (
//     <>
//       <SignIn user={user} />
//       <div>This is the watch page</div>
//       {user && <UploadVideo />}
//     </>
//   );
// }
