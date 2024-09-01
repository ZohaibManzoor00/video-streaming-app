"use client";

import { uploadVideo } from "../firebase/functions";

export default function UploadVideo() {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (file) handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      const response = await uploadVideo(file);
      alert(
        // TODO: Change from alert to logs
        `File uploaded successfully. Server responded with: ${JSON.stringify(
          response
        )}`
      );
    } catch (error) {
      alert(`Failed to upload file: ${error}`);
    }
  };

  return (
    <div className="flex gap-x-2">
      <p>Upload Video</p>
      <label htmlFor="uploadVideo" className="cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </label>
      <input
        className="hidden"
        id="uploadVideo"
        type="file"
        accept="video/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
