"use client";

import { checkVideoStatus, uploadVideo } from "@/app/firebase/videos";
import { DynamicBorder } from "@/components/dynamic-wrappers";
import { useState } from "react";

export default function UploadVideo() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [uploadState, setUploadState] = useState<string | undefined>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (file) handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      const { filename } = await uploadVideo(file);
      // poll firestore
      alert(
        // TODO: Change from alert to logs
        "File uploaded successfully"
      );
      await pollVideoStatus(filename);
    } catch (error) {
      alert(`Failed to upload file: ${error}`);
    }
  };

  async function pollVideoStatus(fileName: string): Promise<void> {
    let pollCount = 0;
    const MAX_POLL_COUNT = 10;

    const pollFirestore = async (delay = 3000): Promise<void> => {
      try {
        pollCount++;
        const res = await checkVideoStatus(fileName);
        console.log(res);
        // if (status === "processed") {
        //   setProcessing(false);
        //   setProcessed(true);
        //   router.refresh();
        //   return;
        // }

        // if (pollCount >= MAX_POLL_COUNT) {
        //   setProcessing(false);
        //   setProcessed(false);
        //   alert("Max polling attempts reached.");
        //   return;
        // }

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
    <DynamicBorder>
      <label className="flex gap-x-2 cursor-pointer p-1">
        <p className="text-slate-200">Video</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.2}
          stroke="currentColor"
          className="w-6 h-6 text-slate-200"
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
  );
}
