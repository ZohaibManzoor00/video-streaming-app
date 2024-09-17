"use client";

import { checkVideoStatus, uploadVideo } from "@/app/firebase/videos";
import { DynamicBorder } from "@/components/dynamic-wrappers";
import { useState } from "react";

type Video = {
  status?: "processing" | "processed" | "failed";
  progress?:
    | "initializing"
    | "downloading"
    | "processing"
    | "uploading"
    | "complete";
};

export default function UploadVideo() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Video["progress"]>(undefined);
  const [uploadState, setUploadState] = useState<Video["status"]>(undefined);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (file) handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const { filename } = await uploadVideo(file);
      setUploading(false);
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
        const { status, progress } = await checkVideoStatus(fileName);

        setUploadState(status);
        setProgress(progress);

        if (
          status === "processed" ||
          status === "failed" ||
          pollCount >= MAX_POLL_COUNT
        ) {
          return;
        }

        setTimeout(
          () => pollFirestore(pollCount < 6 ? delay : delay * 1.5),
          delay
        ); // Poll with exponential backoff
      } catch (error) {
        console.error("Error polling video status:", error);
        setUploadState("failed");
        alert("An error occurred while polling the video processing status.");
      }
    };

    await pollFirestore();
  }

  return (
    <>
      {uploading || uploadState ? (
        <p className="text-slate-200 text-lg">
          Uploading Status: {uploadState} Progress: {progress && progress}
        </p>
      ) : (
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
      )}
    </>
  );
}
