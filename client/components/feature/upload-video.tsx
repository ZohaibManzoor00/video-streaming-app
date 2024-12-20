"use client";

import { uploadVideo, VideoProgress, VideoStatus } from "@/firebase/videos";
import { useState } from "react";

export default function UploadVideo() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<VideoProgress | null>(null);
  const [uploadState, setUploadState] = useState<VideoStatus | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (file) handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const res = await uploadVideo(file);
      setUploading(false);
    } catch (error) {
      alert(`Failed to upload file: ${error}`);
    }
  };

  return (
    <>
      {uploading || uploadState ? (
        <p className="text-slate-200 text-lg">Uploading</p>
      ) : (
        <label className="flex gap-x-2 cursor-pointer p-1">
          <p className="text-slate-200">Upload a Video</p>
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
      )}
    </>
  );
}
