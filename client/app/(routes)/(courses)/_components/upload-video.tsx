"use client";

import { getVideoProcessingStatus, uploadVideo } from "@/app/firebase/videos";
import { DynamicBorder } from "@/components/dynamic-wrappers";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UploadVideo() {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (file) handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const { fileName } = await uploadVideo(file);
      setUploading(false);
      setProcessing(true);
      await pollVideoProcessingStatus(fileName);
    } catch (error) {
      alert(`Failed to upload file: ${error}`);
    }
  };

  async function pollVideoProcessingStatus(fileName: string): Promise<void> {
    let pollCount = 0;
    const MAX_POLL_COUNT = 10;

    const pollFirestore = async (delay = 3000): Promise<void> => {
      try {
        pollCount++;
        const status = await getVideoProcessingStatus(fileName, "videos");
        console.log({ status });

        if (status === "processed") {
          setProcessing(false);
          setProcessed(true);
          router.refresh();
          return;
        }

        if (pollCount >= MAX_POLL_COUNT) {
          setProcessing(false);
          setProcessed(false);
          alert("Max polling attempts reached.");
          return;
        }

        setTimeout(() => pollFirestore(delay * 1.5), delay);
      } catch (error) {
        console.error("Error polling video status:", error);
        setProcessing(false);
        alert("An error occurred while polling the video processing status.");
      }
    };

    await pollFirestore();
  }

  return (
    <div>
      {uploading || processing ? (
        <div className="text-slate-200 border-1 border mt-4 p-2">
          <p>Video Uploading Status:</p>
          {uploading && <p>Uploading...</p>}
          {processing && <p>Processing...</p>}
          {processed && <p>Your video is ready to watch!</p>}
        </div>
      ) : (
        // <button
        //   type="button"
        //   className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-2 text-center hover:border-gray-400 focus:outline-none "
        // >
        //   <svg
        //     xmlns="http://www.w3.org/2000/svg"
        //     fill="none"
        //     viewBox="0 0 24 24"
        //     strokeWidth={1.2}
        //     stroke="currentColor"
        //     className="w-6 h-6 text-slate-200"
        //   >
        //     <path
        //       strokeLinecap="round"
        //       d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
        //     />
        //   </svg>
        //   <span className="mt-2 block text-sm text-slate-200">
        //     Upload Video
        //   </span>
        // </button>
        <DynamicBorder styles="rounded-lg border-dashed hover:border-gray-400 cursor-pointer">
          <label className="flex gap-x-1 cursor-pointer p-4 items-center">
            <p className="text-slate-200">Upload Video</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.2}
              stroke="currentColor"
              className="h-full w-6 text-slate-200"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <input
              className="hidden"
              id="uploadVideo"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
            />
          </label>
        </DynamicBorder>
      )}
    </div>
  );
}
