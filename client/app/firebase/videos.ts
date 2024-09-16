import { rawVideoBucketName } from "./firebase";
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const generateUploadUrlFunction = httpsCallable(functions, "generateUploadUrl");
const getVideosFunction = httpsCallable(functions, "getVideos");
const checkProcessingStatusFunction = httpsCallable(
  functions,
  "checkProcessingStatus"
);
const deleteVideoFunction = httpsCallable(functions, "deleteVideo");

type Video = {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed" | "pending" | "failed";
};

export async function uploadVideo(file: File) {
  const response: any = await generateUploadUrlFunction({
    fileExtension: file.name.split(".").pop(),
    bucket: rawVideoBucketName,
  });

  // Upload to raw bucket via signed URL
  const uploadResult = await fetch(response?.data?.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!uploadResult.ok) throw new Error("Failed Upload");

  return { fileName: response?.data?.fileName?.split(".")[0] };
}

export async function getVideos() {
  const res = await getVideosFunction();
  return res.data as Video[];
}

export async function getVideoProcessingStatus(
  fileName: any,
  collectionId: string
) {
  const res = await checkProcessingStatusFunction({ fileName, collectionId });
  const video = res.data as Video;
  return video?.status;
}

export async function deleteVideo(videoId: string, fileName: string) {
  return deleteVideoFunction({
    videoId,
    fileName,
    bucketName: "marcy-yt-processed-videos",
  });
}
