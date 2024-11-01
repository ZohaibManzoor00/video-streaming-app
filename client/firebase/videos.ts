import { httpsCallable } from "firebase/functions";
import { functions , rawVideoBucketName } from "./firebase";

const generateUploadUrlFunction = httpsCallable(functions, "generateUploadUrl");
const getVideosFunction = httpsCallable(functions, "getVideos");
const checkVideoStatusFunction = httpsCallable(functions, "checkVideoStatus");
const incrementViewCountFunction = httpsCallable(functions, "incrementViewCount");

// ? Add processing start and end times
export type Video = {
  id?: string;
  uid?: string;
  filename?: string;
  status?: VideoStatus;
  progress?: VideoProgress;
  transcodingProgress?: number;
  retryCount?: number; // ! change to processingAttempts
  errorMessage?: string;
  duration?: number;
  createdAt?: Date;
  viewCount?: number;
};

export enum VideoStatus {
  Processing = "processing",
  Processed = "processed",
  Failed = "failed",
  PermanentlyFailed = "permanently failed",
}

export enum VideoProgress {
  Initializing = "initializing",
  Downloading = "downloading",
  Transcoding = "transcoding",
  GeneratingThumbnail = "generating thumbnail",
  Uploading = "uploading",
  Complete = "complete",
}

export const uploadVideo = async (file: File) => {
  const response: any = await generateUploadUrlFunction({
    fileExtension: file.name.split(".").pop(),
    fileName: file.name,
    bucket: rawVideoBucketName,
  });

  // Upload file to raw g-cloud bucket via signed URL
  const uploadResult = await fetch(response?.data?.url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!uploadResult.ok) throw new Error("Failed Upload");

  const filename = response.data?.fileName?.split(".")[0] || "";

  return { filename };
}

export const checkVideoStatus = async (fileName: any) => {
  const res = await checkVideoStatusFunction({ fileName });
  return res.data as { status: VideoStatus, progress: VideoProgress };
}

export const getVideos = async () => {
  const res = await getVideosFunction();
  return res.data as Video[];
}

export const handlePlay = async (videoId: string) => {
  try {
    await incrementViewCountFunction({ videoId });
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
};
