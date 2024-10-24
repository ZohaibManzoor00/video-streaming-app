"use client";

import { uploadImage } from "@/firebase/images";

export default function UploadImage() {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (file) handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      const response = await uploadImage(file);
      alert(
        // TODO: Change from alert to logs
        `Image uploaded successfully. Server responded with: ${JSON.stringify(
          response
        )}`
      );
    } catch (error) {
      alert(`Failed to upload file: ${error}`);
    }
  };

  return (
    <label className="flex gap-x-2 cursor-pointer">
      <p className="text-slate-200">Image</p>
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
        id="uploadImage"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </label>
  );
}
