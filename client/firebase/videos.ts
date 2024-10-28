import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const generateUploadUrlFunction = httpsCallable(functions, "generateUploadUrl");
const getVideosFunction = httpsCallable(functions, "getVideos");
const checkVideoStatusFunction = httpsCallable(functions, "checkVideoStatus");
const incrementViewCountFunction = httpsCallable(functions, "incrementViewCount");

const rawVideoBucketName = "marcy-yt-raw-videos";

export type Video = {
  id?: string;
  uid?: string;
  filename?: string;
  status?: VideoStatus;
  progress?: VideoProgress;
  transcodingProgress?: number;
  retryCount?: number;
  errorMessage?: string;
  duration?: number,
  createdAt?: Date,
  viewCount?: number
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
  Uploading = "uploading",
  Complete = "complete",
}

export const uploadVideo = async (file: File) => {
  const response: any = await generateUploadUrlFunction({
    fileExtension: file.name.split(".").pop(),
    bucket: rawVideoBucketName,
  });

  // Upload file to raw g-cloud bucket via signed URL
  const uploadResult = await fetch(response?.data?.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!uploadResult.ok) throw new Error("Failed Upload");

  const filename = response.data?.fileName?.split(".")[0] || "";

  return { filename };
}

export const checkVideoStatus = async (fileName: any) => {
  const res = await checkVideoStatusFunction({ fileName });
  return res.data as { status: Video["status"], progress: Video["progress"]};
}

export const getVideos = async () => {
  const res = await getVideosFunction();
  return res.data as Video[];
}

export const handlePlay = async (videoId: string) => {
  try {
    await incrementViewCountFunction({ videoId });
    console.log("View count incremented successfully");
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
};
